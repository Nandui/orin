import { Fragment } from 'react';
import type { Category, Story, StorySort } from '@/types';
import { CATEGORIES } from '@/types';
import { getRising, getStories } from '@/lib/stories';
import { PostCard } from '@/components/feed/PostCard';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { FeedControls } from '@/components/feed/FeedControls';
import { RightRail } from '@/components/feed/RightRail';
import { EmptyState } from '@/components/feed/EmptyState';
import { AdSlot } from '@/components/layout/AdSlot';

export const dynamic = 'force-dynamic';

const SORTS: StorySort[] = ['trending', 'new', 'top'];

// Sticky header offset that clears the fixed mobile top bar (incl. safe area).
const STICKY =
  'sticky top-[calc(3.5rem_+_env(safe-area-inset-top))] z-20 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur lg:top-0';

type SearchParams = Promise<{ sort?: string; category?: string; q?: string }>;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sort: StorySort = SORTS.includes(sp.sort as StorySort)
    ? (sp.sort as StorySort)
    : 'trending';
  const category: Category | null = CATEGORIES.includes(sp.category as Category)
    ? (sp.category as Category)
    : null;
  const q = (sp.q ?? '').trim();
  const isHome = !category && !q;

  const [storiesRaw, trending] = await Promise.all([
    getStories({ sort, category, period: '7days', limit: 40 }),
    getRising(5),
  ]);

  const stories = q
    ? storiesRaw.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))
    : storiesRaw;

  // Filtered / search view: same bordered column + the same sticky sort tabs.
  if (!isHome) {
    const heading = q ? `“${q}”` : (category as string);
    return (
      <div className="flex justify-center">
        <main className="w-full max-w-[640px] border-x border-[var(--line)]">
          <div className={STICKY}>
            <h1 className="px-4 pt-3 text-xl font-extrabold text-white">
              {heading}
            </h1>
            <FeedTabs sort={sort} category={category} q={q || undefined} />
            <FeedControls sort={sort} category={category} q={q || undefined} />
          </div>
          <Feed stories={stories} ranked={sort === 'top'} filtered />
        </main>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[640px] border-x border-[var(--line)]">
        <div className={STICKY}>
          <h1 className="px-4 pt-3 text-xl font-extrabold text-white">Home</h1>
          <FeedTabs sort={sort} />
        </div>
        <Feed stories={stories} ranked={sort === 'top'} />
      </main>
      <RightRail trending={trending} />
    </div>
  );
}

function Feed({
  stories,
  ranked,
  filtered = false,
}: {
  stories: Story[];
  ranked: boolean;
  filtered?: boolean;
}) {
  if (stories.length === 0) {
    return filtered ? (
      <EmptyState
        title="No stories match this filter"
        message="Try a different topic or sort."
        actionHref="/"
        actionLabel="Back to Home"
      />
    ) : (
      <EmptyState
        title="No stories yet"
        message="Fresh gaming news is on its way — check back soon."
      />
    );
  }

  // One in-feed Sponsored slot, early but present even on short feeds.
  const adAt = stories.length > 3 ? Math.min(4, stories.length - 1) : -1;

  return (
    <div>
      {stories.map((s, i) => (
        <Fragment key={s.id}>
          <PostCard story={s} rank={ranked ? i + 1 : undefined} />
          {i === adAt ? <AdSlot slot="feed-inline" /> : null}
        </Fragment>
      ))}
    </div>
  );
}
