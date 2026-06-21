import Link from 'next/link';
import { ArrowBigUp, Clock, Flame, MessageSquare, TrendingUp } from 'lucide-react';
import type { Highlight, HighlightKind } from '@/types';
import { formatCount } from '@/lib/utils';

const ICONS: Record<HighlightKind, typeof Flame> = {
  icymi: Clock,
  most_viewed: ArrowBigUp,
  most_debated: MessageSquare,
  fastest_climbing: TrendingUp,
};

function metricFor(h: Highlight): string {
  switch (h.kind) {
    case 'most_viewed':
      return `${formatCount(h.story.like_count)} upvotes`;
    case 'most_debated':
      return `${formatCount(h.story.comment_count)} comments`;
    case 'fastest_climbing':
      return `+${h.story.rank_delta} today`;
    default:
      return h.story.source_domain;
  }
}

export function HighlightStrip({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Today&apos;s Highlights
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {highlights.map((h) => {
          const Icon = ICONS[h.kind];
          return (
            <Link
              key={h.kind}
              href={`/story/${h.story.id}`}
              className="group flex flex-col justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900/70"
            >
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <Icon className="h-3.5 w-3.5" />
                {h.label}
              </div>
              <h3 className="mb-2 line-clamp-3 text-sm font-semibold leading-snug text-neutral-100 group-hover:text-white">
                {h.story.title}
              </h3>
              <span className="text-[11px] font-medium text-neutral-500">
                {metricFor(h)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
