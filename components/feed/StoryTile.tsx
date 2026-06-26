import Link from 'next/link';
import type { Story } from '@/types';
import { categoryColor, timeAgo } from '@/lib/utils';

// Newspaper ledger row for the "Latest" grid: kicker, serif headline, dateline,
// and a small thumbnail, separated by a hairline rule.
export function StoryTile({ story }: { story: Story }) {
  return (
    <Link
      href={`/story/${story.id}`}
      className="group flex items-start gap-4 border-b border-white/10 py-4"
    >
      <div className="min-w-0 flex-1">
        <span
          className="kicker text-[10px] font-bold"
          style={{ color: categoryColor(story.category) }}
        >
          {story.category}
        </span>
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-snug text-white group-hover:text-[var(--gold)]">
          {story.title}
        </h3>
        <p className="kicker mt-1.5 text-[10px] text-neutral-500">
          {story.source_domain} · {timeAgo(story.published_at)} ago
        </p>
      </div>

      <span className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-800">
        {story.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </span>
    </Link>
  );
}
