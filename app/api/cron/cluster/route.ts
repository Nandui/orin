import { json, requireCron } from '@/lib/api';
import { runCluster } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/cluster — v1 keyword clustering over the pending queue (spec §7.2).
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;
  return json(await runCluster());
}
