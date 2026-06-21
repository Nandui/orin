import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import type { Story } from '@/types';
import { formatCount } from '@/lib/utils';
import { RankDelta } from '@/components/ui/RankDelta';

export function RisingSidebar({ stories }: { stories: Story[] }) {
  if (stories.length === 0) return null;

  return (
    <section className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-green-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Rising
        </h2>
      </div>
      <ol className="flex flex-col gap-3">
        {stories.map((story, i) => (
          <li key={story.id} className="flex gap-3">
            <span className="w-4 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-neutral-600">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/story/${story.id}`}
                className="line-clamp-2 text-[13px] font-medium leading-snug text-neutral-200 hover:text-white"
              >
                {story.title}
              </Link>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
                <span>{formatCount(story.like_count)} upvotes</span>
                <RankDelta delta={story.rank_delta} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
