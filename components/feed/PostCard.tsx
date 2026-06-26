import Link from 'next/link';
import { Avatar } from '@base-ui-components/react/avatar';
import type { Story } from '@/types';
import { timeAgo } from '@/lib/utils';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { PostActions } from '@/components/feed/PostActions';

// A single feed item, styled like an X/Reddit post. The whole card is one click
// target (an absolute overlay link to the story); the action row is raised above
// it so its controls stay independently clickable.
export function PostCard({ story, rank }: { story: Story; rank?: number }) {
  const favicon = `https://www.google.com/s2/favicons?domain=${story.source_domain}&sz=64`;
  const detail = `/story/${story.id}`;

  return (
    <article className="relative border-b border-[var(--line)] px-4 py-3 transition-colors hover:bg-white/[0.03]">
      {/* Whole-card overlay link — click anywhere opens the story. */}
      <Link
        href={detail}
        aria-label={story.title}
        className="absolute inset-0 focus-visible:rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
      />

      <div className="flex gap-3">
        <Avatar.Root className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#16181c] ring-1 ring-white/10">
          <Avatar.Image
            src={favicon}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
          <Avatar.Fallback className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-300">
            {story.source_domain.slice(0, 1).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[15px] leading-tight">
            {rank ? (
              <span className="mr-0.5 shrink-0 font-bold text-[var(--accent)]">
                #{rank}
              </span>
            ) : null}
            <span className="truncate font-bold text-white">
              {story.source_domain}
            </span>
            <span className="shrink-0">
              <CategoryPill category={story.category} />
            </span>
            <span className="muted shrink-0">·</span>
            <span className="muted shrink-0">{timeAgo(story.published_at)}</span>
          </div>

          <h2 className="mt-0.5 text-[17px] font-semibold leading-snug text-white">
            {story.title}
          </h2>
          {story.summary ? (
            <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-neutral-400">
              {story.summary}
            </p>
          ) : null}

          {story.image_url ? (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.image_url}
                alt=""
                loading="lazy"
                className="aspect-[16/9] w-full rounded-2xl border border-[var(--line)] object-cover"
              />
            </div>
          ) : null}

          {/* Raised above the overlay so its controls remain clickable. */}
          <PostActions
            storyId={story.id}
            title={story.title}
            sourceUrl={story.url}
            views={story.view_count}
          />
        </div>
      </div>
    </article>
  );
}
