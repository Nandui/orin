import Link from 'next/link';
import type { Story } from '@/types';
import { categoryColor, timeAgo } from '@/lib/utils';

// "Popular Forums"-style tile for the 2-column grid.
export function StoryTile({ story }: { story: Story }) {
  const color = categoryColor(story.category);
  const age = timeAgo(story.published_at);
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

      {age ? (
        <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-neutral-300">
          {age}
        </span>
      ) : null}
    </Link>
  );
}
