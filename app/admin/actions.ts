'use server';

import {
  runAnalyze,
  runCleanupAds,
  runCluster,
  runIngest,
  runRank,
} from '@/lib/pipeline';
import { revalidatePath } from 'next/cache';

export type RefreshResult = {
  ok: boolean;
  removed: number;
  ingested: number;
  analyzed: number;
  error?: string;
};

// Runs the full pipeline in-process (same stages as the daily cron), kicked off
// by the in-app "Refresh" button. No secret needed in the browser — the work
// happens server-side, and the page itself sits behind your Vercel login.
export async function refreshFeed(): Promise<RefreshResult> {
  try {
    const cleanup = await runCleanupAds();
    const ingest = await runIngest();
    await runCluster();
    const analyze = await runAnalyze();
    await runRank();

    // Drop cached feed pages so the home page reflects the new stories.
    revalidatePath('/');

    return {
      ok: true,
      removed: Number((cleanup as { removed?: number }).removed ?? 0),
      ingested: Number((ingest as { inserted?: number }).inserted ?? 0),
      analyzed: Number((analyze as { analyzed?: number }).analyzed ?? 0),
    };
  } catch (err) {
    return {
      ok: false,
      removed: 0,
      ingested: 0,
      analyzed: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
