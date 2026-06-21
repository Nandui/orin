import { json, requireCron } from '@/lib/api';
import { getServiceClient } from '@/lib/supabase/server';
import { SEED_SOURCES, detectCategory, fetchFeed } from '@/lib/rss';
import { QUEUE_ANALYSIS, QUEUE_CLUSTER, enqueue } from '@/lib/redis';
import type { Category } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/ingest — RSS crawl (Vercel Cron, every 5 min; product spec §7.1).
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;

  const supabase = getServiceClient();
  if (!supabase) return json({ ok: false, reason: 'supabase_not_configured' });

  // 1. Active sources (fall back to the seed list when the table is empty).
  const { data: sourceRows, error: sourcesError } = await supabase
    .from('rss_sources')
    .select('id, url, category')
    .eq('is_active', true);
  if (sourcesError) {
    console.error('[cron/ingest] rss_sources query error:', sourcesError.message);
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

    // Insert only genuinely new stories (existing urls are skipped via the
    // unique constraint), and capture their ids to fan out for processing.
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
      console.error('[cron/ingest] insert error:', error.message);
    }
  }

  console.log('[cron/ingest] done', { sources: sources.length, inserted });

  if (crawledIds.length) {
    await supabase
      .from('rss_sources')
      .update({ last_crawled_at: new Date().toISOString() })
      .in('id', crawledIds);
  }

  return json({ ok: true, sources: sources.length, inserted });
}
