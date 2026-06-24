import Link from 'next/link';
import { ArrowBigUp, ExternalLink, MessageSquare } from 'lucide-react';
import type { Story } from '@/types';
import { cn, formatCount } from '@/lib/utils';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { RankDelta } from '@/components/ui/RankDelta';

// "Top Games"-style ranked list row. Engagement (▲ upvotes / comments) comes
// from the original Reddit thread, Digg-style.
export function StoryCard({
  story,
  rank,
  timeLabel,
}: {
  story: Story;
  rank: number;
  timeLabel: string;
}) {
  const hasThread = Boolean(story.discussion_url);

  return (
    <article className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-[#151517] sm:gap-4 sm:p-3">
      <div className="flex w-7 shrink-0 flex-col items-center pt-1">
        <span
          className={cn(
            'font-display text-2xl font-bold tabular-nums',
            rank === 1 ? 'text-[#ff2d4d]' : 'text-neutral-500',
          )}
        >
          {rank}
        </span>
        <RankDelta delta={story.rank_delta} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-display mb-1 truncate text-base font-semibold uppercase text-neutral-100">
          <Link href={`/story/${story.id}`} className="hover:text-white">
            {story.title}
          </Link>
        </h3>

        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="font-medium text-neutral-400">
            {story.source_domain}
          </span>
          <span aria-hidden>·</span>
          <span>{timeLabel}</span>
          <CategoryPill category={story.category} />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-[#ff2d4d]">
            <ArrowBigUp className="h-4 w-4" />
            {formatCount(story.like_count)}
          </span>

          {hasThread ? (
            <a
              href={story.discussion_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium text-neutral-400 transition-colors hover:text-white"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {formatCount(story.comment_count)}
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300">Discussion</span>
            </a>
          ) : (
            <span className="flex items-center gap-1 font-medium text-neutral-500">
              <MessageSquare className="h-3.5 w-3.5" />
              {formatCount(story.comment_count)}
            </span>
          )}

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
    </article>
  );
}
