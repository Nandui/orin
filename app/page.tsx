import type { Category, StorySort } from '@/types';
import { CATEGORIES } from '@/types';
import { getHighlights, getRising, getStars, getStories } from '@/lib/stories';
import { FeedControls } from '@/components/feed/FeedControls';
import { HighlightStrip } from '@/components/feed/HighlightStrip';
import { StoryList } from '@/components/feed/StoryList';
import { RisingSidebar } from '@/components/feed/RisingSidebar';
import { StarsSidebar } from '@/components/feed/StarsSidebar';
import { AdSlot } from '@/components/layout/AdSlot';

// The feed is request-time dynamic (live ranking + per-query filters).
export const dynamic = 'force-dynamic';

const SORTS: StorySort[] = ['trending', 'new', 'top'];

type SearchParams = Promise<{
  sort?: string;
  category?: string;
  q?: string;
}>;

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

  const [storiesRaw, highlights, rising, stars] = await Promise.all([
    getStories({ sort, category, period: '7days', limit: 30 }),
    isHome ? getHighlights() : Promise.resolve([]),
    getRising(6),
    getStars(5),
  ]);

  const stories = q
    ? storiesRaw.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))
    : storiesRaw;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        {isHome ? <HighlightStrip highlights={highlights} /> : null}

        {q ? (
          <p className="mb-4 text-sm text-neutral-400">
            {stories.length} result{stories.length === 1 ? '' : 's'} for{' '}
            <span className="font-semibold text-white">“{q}”</span>
          </p>
        ) : null}

        <FeedControls sort={sort} category={category} q={q || undefined} />
        <StoryList stories={stories} withInlineAd={isHome} />
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-72">
        <RisingSidebar stories={rising} />
        <AdSlot slot="sidebar" />
        <StarsSidebar stories={stars} />
      </aside>
    </div>
  );
}
