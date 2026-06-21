import { json, requireCron } from '@/lib/api';
import { runAnalyze } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// /api/cron/analyze — generate AI overview/analysis/sentiment for queued
// stories (product spec §7.3). DeepSeek (deepseek-chat) when configured, else
// Claude (claude-sonnet-4-6).
export async function GET(req: Request) {
  const unauthorized = requireCron(req);
  if (unauthorized) return unauthorized;
  return json(await runAnalyze());
}
