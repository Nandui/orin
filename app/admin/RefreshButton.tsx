'use client';

import { useState, useTransition } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { refreshFeed, type RefreshResult } from './actions';

export function RefreshButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<RefreshResult | null>(null);

  function run() {
    setResult(null);
    startTransition(async () => {
      setResult(await refreshFeed());
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-[#2f6bff] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {pending ? 'Refreshing the feed…' : 'Refresh feed now'}
      </button>

      {pending ? (
        <p className="text-xs text-neutral-500">
          Crawling every source, removing ads, clustering and running AI analysis.
          This can take up to a minute — keep this tab open.
        </p>
      ) : null}

      {result ? (
        result.ok ? (
          <div className="rounded-xl bg-[#141417] p-4 text-sm ring-1 ring-white/5">
            <p className="mb-2 font-semibold text-emerald-400">Feed refreshed ✓</p>
            <ul className="flex flex-col gap-1 text-neutral-300">
              <li>
                <span className="text-neutral-500">Ads removed:</span> {result.removed}
              </li>
              <li>
                <span className="text-neutral-500">New stories added:</span>{' '}
                {result.ingested}
              </li>
              <li>
                <span className="text-neutral-500">Stories analyzed:</span>{' '}
                {result.analyzed}
              </li>
            </ul>
          </div>
        ) : (
          <div className="rounded-xl bg-[#141417] p-4 text-sm text-red-400 ring-1 ring-white/5">
            Refresh failed: {result.error}
          </div>
        )
      ) : null}
    </div>
  );
}
