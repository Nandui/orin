import type { Category, StorySort } from '@/types';
import { CATEGORIES } from '@/types';
import { getRising, getStories } from '@/lib/stories';
import { Hero } from '@/components/feed/Hero';
import { FeedControls } from '@/components/feed/FeedControls';
import { StoryList } from '@/components/feed/StoryList';
import { RisingCard } from '@/components/feed/RisingCard';

export const dynamic = 'force-dynamic';

const SORTS: StorySort[] = ['trending', 'new', 'top'];

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

  const [storiesRaw, rising] = await Promise.all([
    getStories({ sort, category, period: '7days', limit: 30 }),
    getRising(6),
  ]);

  const stories = q
    ? storiesRaw.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))
    : storiesRaw;

  // Filtered / search view — simple ranked list.
  if (!isHome) {
    return (
      <div>
        {q ? (
          <p className="mb-4 text-sm text-neutral-400">
            {stories.length} result{stories.length === 1 ? '' : 's'} for{' '}
            <span className="font-semibold text-white">“{q}”</span>
          </p>
        ) : null}
        <FeedControls sort={sort} category={category} q={q || undefined} />
        <StoryList stories={stories} />
      </div>
    );
  }

  // Home dashboard.
  const featured = stories[0];
  const top = stories.slice(1, 13);

  return (
    <div>
      {featured ? <Hero story={featured} /> : null}

      <FeedControls sort={sort} category={category} />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Top stories */}
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold uppercase text-white">
              Top Stories
            </h2>
            <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              This week
            </span>
          </div>
          <StoryList stories={top} startRank={2} />
        </section>

        {/* Rising — Live Channels style */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold uppercase text-white">
              Rising
            </h2>
            <span className="rounded-full bg-[#151517] px-3 py-1 text-xs font-medium text-neutral-300 ring-1 ring-white/5">
              Popular
            </span>
          </div>
          {rising.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {rising.map((story) => (
                <RisingCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#151517] p-6 text-center text-sm text-neutral-500 ring-1 ring-white/5">
              Nothing rising right now.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
