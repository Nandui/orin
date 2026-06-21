import { json, requireCron } from '@/lib/api';
import { runRank } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/rank — recompute scores + flush hot view counts (spec §7.4/7.5).
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;
  return json(await runRank());
}
