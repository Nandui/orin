import { json, requireCron } from '@/lib/api';
import { runEngagement } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/engagement — pull original-discussion stats (Reddit) for stories
// that haven't been checked yet.
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;
  return json(await runEngagement());
}
