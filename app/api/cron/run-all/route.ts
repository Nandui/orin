import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/run-all — runs the full pipeline in order in a single invocation.
// This lets the whole pipeline run under ONE cron job, which keeps automation
// working on the Vercel Hobby plan (limited to once-per-day cron jobs). On Pro,
// prefer the four independent */5–*/10 crons (see README) for fresher data.
//
// Auth: accepts the cron Bearer token OR a `?key=<CRON_SECRET>` query param so
// it can be triggered manually from a browser. The individual stage routes it
// calls still require the Bearer header, which this route supplies internally.
const STEPS = ['ingest', 'cluster', 'analyze', 'rank'] as const;

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

  const origin = url.origin;
  const headers: Record<string, string> = secret
    ? { authorization: `Bearer ${secret}` }
    : {};

  const results: Record<string, unknown> = {};
  for (const step of STEPS) {
    try {
      const res = await fetch(`${origin}/api/cron/${step}`, {
        headers,
        cache: 'no-store',
      });
      results[step] = await res.json().catch(() => ({ status: res.status }));
    } catch {
      results[step] = { error: 'fetch_failed' };
    }
  }

  console.log('[cron/run-all] results', JSON.stringify(results));
  return json({ ok: true, ran: STEPS, results });
}
