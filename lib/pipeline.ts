import { getServiceClient } from '@/lib/supabase/server';
import { SEED_SOURCES, detectCategory, fetchFeed } from '@/lib/rss';
import {
  QUEUE_ANALYSIS,
  QUEUE_CLUSTER,
  dequeue,
  drainViewCounters,
  enqueue,
} from '@/lib/redis';
import { rankStories } from '@/lib/ranking';
import { generateStoryAnalysis, isAnalysisConfigured } from '@/lib/analysis';
import type { Category } from '@/types';

// The four pipeline stages as in-process functions, so they can be called
// directly from their individual cron routes AND from /api/cron/run-all without
// making internal HTTP requests (which Vercel rejects with 401).

export type StageResult = Record<string, unknown>;

// --- ingest (product spec §7.1) ---
export async function runIngest(): Promise<StageResult> {
  const supabase = getServiceClient();
  if (!supabase) return { ok: false, reason: 'supabase_not_configured' };

  const { data: sourceRows, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('id, url, category')
    .eq('is_active', true);
  if (sourcesError) {
    console.error('[ingest] rss_sources query error:', sourcesError.message);
  }

  const sources: Array<{ id: string | null; url: string; category: Category }> =
    sourceRows && sourceRows.length
      ? sourceRows.map((s) => ({
          id: s.id as string,
          url: s.url as string,
          category: s.category as Category,
        }))
      : SEED_SOURCES.map((s) => ({ id: null, url: s.url, category: s.category }));

  let inserted = 0;
  const crawledIds: string[] = [];

  for (const source of sources) {
    const items = await fetchFeed(source.url, source.category);
    if (source.id) crawledIds.push(source.id);
    if (!items.length) continue;

    const rows = items.map((item) => ({
      source_id: source.id,
      title: item.title,
      url: item.url,
      source_domain: item.source_domain,
      summary: item.summary,
      image_url: item.image_url,
      category: detectCategory(item.title, source.category),
      published_at: item.published_at,
    }));

    const { data: newRows, error } = await supabase
      .from('stories')
      .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
      .select('id');

    if (!error && newRows) {
      inserted += newRows.length;
      for (const r of newRows) {
        const id = String(r.id);
        await enqueue(QUEUE_CLUSTER, id);
        await enqueue(QUEUE_ANALYSIS, id);
      }
    } else if (error) {
      console.error('[ingest] insert error:', error.message);
    }
  }

  if (crawledIds.length) {
    await supabase
      .from('rss_sources')
      .update({ last_crawled_at: new Date().toISOString() })
      .in('id', crawledIds);
  }

  console.log('[ingest] done', { sources: sources.length, inserted });
  return { ok: true, sources: sources.length, inserted };
}

// --- cluster v1 keyword grouping (product spec §7.2) ---
const CLUSTER_WINDOW_MS = 48 * 3_600_000;
const MIN_OVERLAP = 2;
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'for', 'with', 'from', 'this', 'that', 'into',
  'gets', 'new', 'now', 'its', 'has', 'have', 'will', 'are', 'was', 'after',
  'over', 'about', 'your', 'you', 'game', 'games', 'gaming', 'all', 'out',
]);

function topics(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export async function runCluster(): Promise<StageResult> {
  const supabase = getServiceClient();
  if (!supabase) return { ok: false, reason: 'supabase_not_configured' };

  type Pending = { id: string; title: string; category: string; cluster_id: string | null };
  const ids = await dequeue(QUEUE_CLUSTER, 50);
  let pending: Pending[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from('stories')
      .select('id, title, category, cluster_id')
      .in('id', ids);
    pending = (data ?? []) as Pending[];
  } else {
    // No Redis queue configured — fall back to still-unclustered stories.
    const { data } = await supabase
      .from('stories')
      .select('id, title, category, cluster_id')
      .is('cluster_id', null)
      .order('published_at', { ascending: false })
      .limit(50);
    pending = (data ?? []) as Pending[];
  }
  if (!pending.length) return { ok: true, processed: 0 };

  const cutoff = new Date(Date.now() - CLUSTER_WINDOW_MS).toISOString();
  const { data: recentRaw } = await supabase
    .from('stories')
    .select('id, title, cluster_id')
    .gte('published_at', cutoff)
    .not('cluster_id', 'is', null)
    .limit(500);

  const recent = (recentRaw ?? []).map((r) => ({
    cluster_id: r.cluster_id as string,
    topics: topics(String(r.title)),
  }));

  let assigned = 0;
  let created = 0;

  for (const story of pending) {
    if (story.cluster_id) continue;
    const t = topics(String(story.title));
    const match = recent.find(
      (r) => t.filter((w) => r.topics.includes(w)).length >= MIN_OVERLAP,
    );

    if (match) {
      await supabase
        .from('stories')
        .update({ cluster_id: match.cluster_id })
        .eq('id', story.id);
      assigned++;
    } else {
      const { data: cluster } = await supabase
        .from('clusters')
        .insert({ title: story.title, category: story.category, story_count: 1 })
        .select('id')
        .single();
      if (cluster) {
        await supabase
          .from('stories')
          .update({ cluster_id: cluster.id })
          .eq('id', story.id);
        recent.push({ cluster_id: cluster.id as string, topics: t });
        created++;
      }
    }
  }

  console.log('[cluster] done', { processed: pending.length, assigned, created });
  return { ok: true, processed: pending.length, assigned, created };
}

// --- analyze (product spec §7.3) ---
export async function runAnalyze(): Promise<StageResult> {
  const supabase = getServiceClient();
  if (!supabase) return { ok: false, reason: 'supabase_not_configured' };
  if (!isAnalysisConfigured()) {
    return { ok: false, reason: 'no_analysis_provider_configured' };
  }

  type Pending = { id: string; title: string; summary: string | null; cluster_id: string | null };
  const map = (r: Record<string, unknown>): Pending => ({
    id: String(r.id),
    title: String(r.title),
    summary: (r.summary as string) ?? null,
    cluster_id: (r.cluster_id as string) ?? null,
  });

  const ids = await dequeue(QUEUE_ANALYSIS, 15);
  let stories: Pending[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from('stories')
      .select('id, title, summary, cluster_id')
      .in('id', ids);
    stories = (data ?? []).map(map);
  } else {
    // No Redis queue — analyze the newest stories that have no overview yet.
    const { data } = await supabase
      .from('stories')
      .select('id, title, summary, cluster_id')
      .is('ai_overview', null)
      .order('published_at', { ascending: false })
      .limit(15);
    stories = (data ?? []).map(map);
  }
  if (!stories.length) return { ok: true, processed: 0, analyzed: 0 };

  let analyzed = 0;
  // Run a few DeepSeek calls at a time so the batch fits the function limit.
  await inChunks(stories, 5, async (story) => {
    let clusterStories: Array<{ title: string }> = [];
    if (story.cluster_id) {
      const { data } = await supabase
        .from('stories')
        .select('title')
        .eq('cluster_id', story.cluster_id)
        .neq('id', story.id)
        .limit(6);
      clusterStories = (data ?? []).map((s) => ({ title: String(s.title) }));
    }

    const result = await generateStoryAnalysis(
      { title: story.title, summary: story.summary },
      clusterStories,
    );
    if (result) {
      await supabase
        .from('stories')
        .update({
          ai_overview: result.overview,
          ai_analysis: result.analysis,
          ai_sentiment: result.sentiment,
        })
        .eq('id', story.id);
      analyzed++;
    }
  });

  console.log('[analyze] done', { processed: stories.length, analyzed });
  return { ok: true, processed: stories.length, analyzed };
}

// --- rank + flush views (product spec §7.4 / §7.5) ---
const WEEK_MS = 7 * 24 * 3_600_000;
const TRENDING_TOP_N = 12;

async function inChunks<T>(items: T[], size: number, fn: (item: T) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

export async function runRank(): Promise<StageResult> {
  const supabase = getServiceClient();
  if (!supabase) return { ok: false, reason: 'supabase_not_configured' };

  const pending = await drainViewCounters();

  const cutoff = new Date(Date.now() - WEEK_MS).toISOString();
  const { data: rows } = await supabase
    .from('stories')
    .select(
      'id, like_count, comment_count, bookmark_count, view_count, repost_count, published_at, rank_today',
    )
    .gte('published_at', cutoff)
    .limit(1000);

  if (!rows || rows.length === 0) return { ok: true, ranked: 0 };

  const stories = rows.map((r) => ({
    id: String(r.id),
    like_count: Number(r.like_count),
    comment_count: Number(r.comment_count),
    bookmark_count: Number(r.bookmark_count),
    repost_count: Number(r.repost_count),
    view_count: Number(r.view_count) + (pending[String(r.id)] ?? 0),
    published_at: String(r.published_at),
    rank_today: r.rank_today == null ? null : Number(r.rank_today),
  }));

  const ranked = rankStories(stories);
  const byId = new Map(ranked.map((r) => [r.id, r]));

  await inChunks(stories, 20, async (s) => {
    const r = byId.get(s.id);
    if (!r) return;
    await supabase
      .from('stories')
      .update({
        score: r.score,
        rank_today: r.rank_today,
        rank_delta: r.rank_delta,
        view_count: s.view_count,
        is_trending: r.rank_today <= TRENDING_TOP_N,
      })
      .eq('id', s.id);
  });

  console.log('[rank] done', {
    ranked: ranked.length,
    viewsFlushed: Object.keys(pending).length,
  });
  return {
    ok: true,
    ranked: ranked.length,
    viewsFlushed: Object.keys(pending).length,
  };
}
