'use client';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// SPAWN's own ad placement, and the only ads on the site. Hidden for Pro users.
// Phase 1 ships a labelled placeholder; swap the inner markup for the AdSense
// <ins> tag (or a Playwire/Venatus script) when monetization goes live.
export function AdSlot({
  slot,
  className,
}: {
  slot: 'sidebar' | 'feed-inline';
  className?: string;
}) {
  const { isPro } = useAuth();
  if (isPro) return null;

  if (slot === 'feed-inline') {
    return (
      <div
        className={cn(
          'border-b border-[var(--line)] px-4 py-3',
          className,
        )}
        aria-label="Advertisement"
      >
        <p className="muted mb-1.5 text-[11px] font-bold uppercase tracking-widest">
          Sponsored
        </p>
        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 text-[11px] uppercase tracking-widest text-neutral-600">
          Your ad here
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-2xl bg-[#16181c] p-4', className)}
      aria-label="Advertisement"
    >
      <p className="muted mb-2 text-[11px] font-bold uppercase tracking-widest">
        Sponsored
      </p>
      <div className="flex h-[250px] items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 text-[11px] uppercase tracking-widest text-neutral-600">
        Your ad here
      </div>
    </div>
  );
}
