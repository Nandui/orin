import { json, requireCron } from '@/lib/api';
import { getServiceClient } from '@/lib/supabase/server';
import { QUEUE_CLUSTER, dequeue } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const CLUSTER_WINDOW_MS = 48 * 3_600_000;
const MIN_OVERLAP = 2;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'for', 'with', 'from', 'this', 'that', 'into',
  'gets', 'new', 'now', 'its', 'has', 'have', 'will', 'are', 'was', 'after',
  'over', 'about', 'your', 'you', 'game', 'games', 'gaming', 'all', 'out',
]);

/** Significant lowercased tokens from a headline. */
function topics(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

// /api/cron/cluster — v1 keyword clustering over the pending queue (spec §7.2).
// Groups stories whose headlines share >= 2 significant tokens within a 48h
// window. Embedding-based clustering (v2) is a later enhancement.
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;

  const supabase = getServiceClient();
  if (!supabase) return json({ ok: false, reason: 'supabase_not_configured' });

  const ids = await dequeue(QUEUE_CLUSTER, 50);
  if (!ids.length) {
    return json({ ok: true, processed: 0, note: 'queue empty (requires Redis)' });
  }

  const { data: pending } = await supabase
    .from('stories')
    .select('id, title, category, cluster_id')
    .in('id', ids);

  const cutoff = new Date(Date.now() - CLUSTER_WINDOW_MS).toISOString();
  const { data: recentRaw } = await supabase
    .from('stories')
    .select('id, title, cluster_id')
    .gte('published_at', cutoff)
    .not('cluster_id', 'is', null)
    .limit(500);

  const recent = (recentRaw ?? []).map((r) => ({
    title: String(r.title),
    cluster_id: r.cluster_id as string,
    topics: topics(String(r.title)),
  }));

  let assigned = 0;
  let created = 0;

  for (const story of pending ?? []) {
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
        .insert({
          title: story.title,
          category: story.category,
          story_count: 1,
        })
        .select('id')
        .single();

      if (cluster) {
        await supabase
          .from('stories')
          .update({ cluster_id: cluster.id })
          .eq('id', story.id);
        recent.push({
          title: String(story.title),
          cluster_id: cluster.id as string,
          topics: t,
        });
        created++;
      }
    }
  }

  return json({ ok: true, processed: pending?.length ?? 0, assigned, created });
}
