import Link from 'next/link';
import { ArrowBigUp } from 'lucide-react';
import type { Story } from '@/types';
import { categoryColor, formatCount } from '@/lib/utils';

// "Popular Forums"-style tile for the 2-column grid.
export function StoryTile({ story }: { story: Story }) {
  const color = categoryColor(story.category);
  return (
    <Link
      href={`/story/${story.id}`}
      className="flex items-center gap-3 rounded-2xl bg-[#141417] p-3 ring-1 ring-white/5 transition hover:ring-white/15"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {story.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          story.category.slice(0, 1)
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white">
          {story.title}
        </h3>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
          <span style={{ color }}>{story.category}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{story.source_domain}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-neutral-200">
          <ArrowBigUp className="h-3.5 w-3.5 text-[#2f6bff]" />
          {formatCount(story.like_count)}
        </span>
        <span className="text-[11px] text-neutral-500">
          {formatCount(story.comment_count)} comments
        </span>
      </div>
    </Link>
  );
}
