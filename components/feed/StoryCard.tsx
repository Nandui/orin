import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { Story } from '@/types';
import { cn } from '@/lib/utils';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { RankDelta } from '@/components/ui/RankDelta';

// Ranked list row for a news feed: rank, art, headline, and source/time meta.
export function StoryCard({
  story,
  rank,
  timeLabel,
}: {
  story: Story;
  rank: number;
  timeLabel: string;
}) {
  return (
    <article className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-[#141417] sm:gap-4 sm:p-3">
      <div className="flex w-7 shrink-0 flex-col items-center pt-0.5">
        <span
          className={cn(
            'text-xl font-bold tabular-nums',
            rank === 1 ? 'text-[#2f6bff]' : 'text-neutral-500',
          )}
        >
          {rank}
        </span>
        <RankDelta delta={story.rank_delta} />
      </div>

      <Link
        href={`/story/${story.id}`}
        className="relative hidden h-14 w-[88px] shrink-0 overflow-hidden rounded-xl bg-neutral-800 sm:block"
      >
        {story.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="mb-1 truncate text-[15px] font-semibold text-neutral-100">
          <Link href={`/story/${story.id}`} className="hover:text-white">
            {story.title}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <CategoryPill category={story.category} />
          <span className="font-medium text-neutral-400">
            {story.source_domain}
          </span>
          <span aria-hidden>·</span>
          <span>{timeLabel}</span>

          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto hidden items-center gap-1 font-medium text-neutral-500 transition-colors hover:text-neutral-200 sm:flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Source
          </a>
        </div>
      </div>
    </article>
  );
}
