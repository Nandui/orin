import { Fragment } from 'react';
import type { Story } from '@/types';
import { timeAgo } from '@/lib/utils';
import { StoryCard } from '@/components/feed/StoryCard';
import { AdSlot } from '@/components/layout/AdSlot';

// Server component: maps stories to (client) cards, computing the relative time
// label server-side so the client card never re-derives it (no hydration drift).
// Drops an inline ad between story #4 and #5 (product spec §9).
export function StoryList({
  stories,
  startRank = 1,
  withInlineAd = true,
}: {
  stories: Story[];
  startRank?: number;
  withInlineAd?: boolean;
}) {
  if (stories.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-8 text-center text-sm text-neutral-500">
        No stories yet. The ingestion cron will fill this in once sources are
        crawled.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {stories.map((story, i) => (
        <Fragment key={story.id}>
          <StoryCard
            story={story}
            rank={startRank + i}
            timeLabel={timeAgo(story.published_at)}
          />
          {withInlineAd && i === 3 ? (
            <AdSlot slot="feed-inline" className="my-1" />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
