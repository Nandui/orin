import { json, requireCron } from '@/lib/api';
import { getServiceClient } from '@/lib/supabase/server';
import { drainViewCounters } from '@/lib/redis';
import { rankStories } from '@/lib/ranking';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const WEEK_MS = 7 * 24 * 3_600_000;
const TRENDING_TOP_N = 12;

async function inChunks<T>(items: T[], size: number, fn: (item: T) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

// /api/cron/rank — recompute scores + flush hot view counts (product spec §7.4/7.5).
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;

  const supabase = getServiceClient();
  if (!supabase) return json({ ok: false, reason: 'supabase_not_configured' });

  // 1. Flush Redis view counters into Postgres deltas.
  const pending = await drainViewCounters();

  // 2. Load the last 7 days of stories.
  const cutoff = new Date(Date.now() - WEEK_MS).toISOString();
  const { data: rows } = await supabase
    .from('stories')
    .select(
      'id, like_count, comment_count, bookmark_count, view_count, repost_count, published_at, rank_today',
    )
    .gte('published_at', cutoff)
    .limit(1000);

  if (!rows || rows.length === 0) return json({ ok: true, ranked: 0 });

  // Fold pending view deltas into in-memory counts.
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

  // 3. Persist score / rank / delta / flushed views / trending flag.
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

  return json({
    ok: true,
    ranked: ranked.length,
    viewsFlushed: Object.keys(pending).length,
  });
}
