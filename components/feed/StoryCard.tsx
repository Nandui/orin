'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Eye,
  Heart,
  MessageSquare,
  Repeat2,
  ExternalLink,
} from 'lucide-react';
import type { Story } from '@/types';
import { cn, formatCount } from '@/lib/utils';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { RankDelta } from '@/components/ui/RankDelta';

// Numbered feed card (product spec §10 "StoryCard"). Like/bookmark use optimistic
// local state; persistence to /api/votes lands in Phase 2 with auth.
export function StoryCard({
  story,
  rank,
  timeLabel,
}: {
  story: Story;
  rank: number;
  timeLabel: string;
}) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const likeCount = story.like_count + (liked ? 1 : 0);
  const bookmarkCount = story.bookmark_count + (bookmarked ? 1 : 0);

  return (
    <article className="group flex gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900/60 sm:gap-4 sm:p-4">
      {/* Rank */}
      <div className="flex w-8 shrink-0 flex-col items-center pt-1">
        <span className="text-xl font-black tabular-nums text-neutral-500 sm:text-2xl">
          {rank}
        </span>
        <RankDelta delta={story.rank_delta} />
      </div>

      {/* Thumbnail */}
      <Link
        href={`/story/${story.id}`}
        className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-800 sm:block"
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

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <CategoryPill category={story.category} />
          <span className="font-medium text-neutral-400">
            {story.source_domain}
          </span>
          <span aria-hidden>·</span>
          <span>{timeLabel}</span>
          {story.badges.map((b) => (
            <span
              key={b.label}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: b.bg, color: b.color }}
            >
              {b.label}
            </span>
          ))}
        </div>

        <h3 className="mb-2 text-[15px] font-semibold leading-snug text-neutral-100">
          <Link href={`/story/${story.id}`} className="hover:text-white">
            {story.title}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
              liked
                ? 'bg-rose-500/15 text-rose-400'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200',
            )}
            aria-pressed={liked}
          >
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
            {formatCount(likeCount)}
          </button>

          <Link
            href={`/story/${story.id}#comments`}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {formatCount(story.comment_count)}
          </Link>

          <button
            type="button"
            onClick={() => setBookmarked((v) => !v)}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
              bookmarked
                ? 'bg-amber-500/15 text-amber-400'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200',
            )}
            aria-pressed={bookmarked}
          >
            <Bookmark
              className={cn('h-3.5 w-3.5', bookmarked && 'fill-current')}
            />
            {formatCount(bookmarkCount)}
          </button>

          <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500">
            <Repeat2 className="h-3.5 w-3.5" />
            {formatCount(story.repost_count)}
          </span>

          <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500">
            <Eye className="h-3.5 w-3.5" />
            {formatCount(story.view_count)}
          </span>

          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </div>
    </article>
  );
}
