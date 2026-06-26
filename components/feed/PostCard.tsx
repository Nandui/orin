import Link from 'next/link';
import { Avatar } from '@base-ui-components/react/avatar';
import type { Story } from '@/types';
import { categoryColor, timeAgo } from '@/lib/utils';
import { PostActions } from '@/components/feed/PostActions';

// A single feed item, styled like an X/Reddit post: source avatar, a header line
// (source · category · time), the headline + excerpt linking to the story, an
// optional image, and a functional action row.
export function PostCard({ story, rank }: { story: Story; rank?: number }) {
  const favicon = `https://www.google.com/s2/favicons?domain=${story.source_domain}&sz=64`;
  const detail = `/story/${story.id}`;

  return (
    <article className="border-b border-[var(--line)] px-4 py-3 transition-colors hover:bg-white/[0.03]">
      <div className="flex gap-3">
        <Avatar.Root className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#16181c] ring-1 ring-white/10">
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
            <span
              className="shrink-0 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: categoryColor(story.category) }}
            >
              {story.category}
            </span>
            <span className="muted shrink-0">·</span>
            <Link href={detail} className="muted shrink-0 hover:underline">
              {timeAgo(story.published_at)}
            </Link>
          </div>

          <Link href={detail} className="group block">
            <h2 className="mt-0.5 text-[15px] font-semibold leading-snug text-white">
              {story.title}
            </h2>
            {story.summary ? (
              <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-neutral-400">
                {story.summary}
              </p>
            ) : null}
          </Link>

          {story.image_url ? (
            <Link href={detail} className="mt-3 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.image_url}
                alt=""
                loading="lazy"
                className="aspect-[16/9] w-full rounded-2xl border border-[var(--line)] object-cover"
              />
            </Link>
          ) : null}

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
