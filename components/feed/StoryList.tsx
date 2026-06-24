import type { Story } from '@/types';
import { timeAgo } from '@/lib/utils';
import { StoryCard } from '@/components/feed/StoryCard';

// Ranked list. Relative time is computed server-side and passed to each row as
// a string so client/server never disagree (no hydration drift).
export function StoryList({
  stories,
  startRank = 1,
}: {
  stories: Story[];
  startRank?: number;
}) {
  if (stories.length === 0) {
    return (
      <div className="rounded-2xl bg-[#151517] p-8 text-center text-sm text-neutral-500 ring-1 ring-white/5">
        No stories yet. The ingestion cron will fill this in once sources are
        crawled.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {stories.map((story, i) => (
        <StoryCard
          key={story.id}
          story={story}
          rank={startRank + i}
          timeLabel={timeAgo(story.published_at)}
        />
      ))}
    </div>
  );
}
