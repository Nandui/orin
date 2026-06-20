'use client';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Renders an ad placeholder, or nothing for Pro users (product spec §9).
// Phase 1 ships a labelled placeholder; swap the inner markup for the AdSense
// <ins> tag (Phase 2) or Playwire/Venatus script (Phase 3) later.
export function AdSlot({
  slot,
  className,
}: {
  slot: 'sidebar' | 'feed-inline';
  className?: string;
}) {
  const { isPro } = useAuth();
  if (isPro) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 text-[11px] uppercase tracking-widest text-neutral-600',
        slot === 'sidebar' ? 'h-[250px] w-full' : 'h-24 w-full',
        className,
      )}
      aria-label="Advertisement"
    >
      Ad · {slot}
    </div>
  );
}
