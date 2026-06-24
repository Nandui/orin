import { json } from '@/lib/api';
import {
  runAnalyze,
  runCleanupAds,
  runCluster,
  runEngagement,
  runIngest,
  runRank,
} from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/run-all — runs the full pipeline in order, in-process (no internal
// HTTP, which Vercel rejects). One cron job covers the whole pipeline, which
// keeps automation working on the Vercel Hobby plan (once-per-day crons). On
// Pro, prefer the four independent */5–*/10 crons (see README).
//
// Auth: accepts the cron Bearer token OR a `?key=<CRON_SECRET>` query param so
// it can be triggered manually from a browser.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const headerOk = req.headers.get('authorization') === `Bearer ${secret}`;
    const queryOk = url.searchParams.get('key') === secret;
    if (!headerOk && !queryOk) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Sequential: ingest populates, then engagement/cluster/analyze enrich, then
  // rank (which depends on the refreshed engagement counts).
  const results = {
    cleanupAds: await runCleanupAds(),
    ingest: await runIngest(),
    cluster: await runCluster(),
    engagement: await runEngagement(),
    analyze: await runAnalyze(),
    rank: await runRank(),
  };

  console.log('[cron/run-all] results', JSON.stringify(results));
  return json({
    ok: true,
    ran: ['cleanupAds', 'ingest', 'cluster', 'engagement', 'analyze', 'rank'],
    results,
  });
}
