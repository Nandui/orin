import { json, requireCron } from '@/lib/api';
import { runIngest } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/ingest — RSS crawl (Vercel Cron, every 5 min; product spec §7.1).
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;
  return json(await runIngest());
}
