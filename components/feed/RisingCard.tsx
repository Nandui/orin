import Link from 'next/link';
import { ArrowBigUp } from 'lucide-react';
import type { Story } from '@/types';
import { categoryColor, formatCount } from '@/lib/utils';

// "Live Channels"-style card for the Rising column.
export function RisingCard({ story }: { story: Story }) {
  const color = categoryColor(story.category);
  return (
    <Link
      href={`/story/${story.id}`}
      className="group block overflow-hidden rounded-2xl bg-[#151517] ring-1 ring-white/5 transition-colors hover:ring-white/15"
    >
      <div className="relative h-28">
        {story.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151517] to-transparent" />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
          <ArrowBigUp className="h-3.5 w-3.5 text-[#ff2d4d]" />
          {formatCount(story.like_count)}
        </span>
      </div>
      <div className="p-3">
        <h4 className="font-display mb-1 line-clamp-1 text-sm font-semibold uppercase text-white">
          {story.title}
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="truncate">{story.source_domain}</span>
          <span className="ml-auto shrink-0 font-semibold text-neutral-300">
            {formatCount(story.comment_count)} 💬
          </span>
        </div>
      </div>
    </Link>
  );
}
