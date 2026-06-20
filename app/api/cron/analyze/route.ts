import { json, requireCron } from '@/lib/api';
import { getServiceClient } from '@/lib/supabase/server';
import { QUEUE_ANALYSIS, dequeue } from '@/lib/redis';
import { generateStoryAnalysis } from '@/lib/anthropic';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/analyze — generate AI overview/analysis/sentiment for queued
// stories (product spec §7.3). Uses claude-sonnet-4-6 per the spec.
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;

  const supabase = getServiceClient();
  if (!supabase) return json({ ok: false, reason: 'supabase_not_configured' });
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ ok: false, reason: 'anthropic_not_configured' });
  }

  const ids = await dequeue(QUEUE_ANALYSIS, 20);
  if (!ids.length) {
    return json({ ok: true, processed: 0, note: 'queue empty (requires Redis)' });
  }

  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, summary, cluster_id')
    .in('id', ids);

  let analyzed = 0;

  for (const story of stories ?? []) {
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
      { title: String(story.title), summary: (story.summary as string) ?? null },
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
  }

  return json({ ok: true, processed: stories?.length ?? 0, analyzed });
}
