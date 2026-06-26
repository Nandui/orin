import type { Category, StorySort } from '@/types';
import { CATEGORIES } from '@/types';
import { getRising, getStories } from '@/lib/stories';
import { PostCard } from '@/components/feed/PostCard';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { FeedControls } from '@/components/feed/FeedControls';
import { RightRail } from '@/components/feed/RightRail';

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

  const [storiesRaw, trending] = await Promise.all([
    getStories({ sort, category, period: '7days', limit: 40 }),
    getRising(5),
  ]);

  const stories = q
    ? storiesRaw.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))
    : storiesRaw;

  // Filtered / search view: a single bordered column with the controls on top.
  if (!isHome) {
    const heading = q ? `“${q}”` : (category as string);
    return (
      <div className="flex justify-center">
        <main className="w-full max-w-[640px] border-x border-[var(--line)]">
          <FeedHeader title={heading} subtitle={`${stories.length} stories`} />
          <div className="p-3">
            <FeedControls sort={sort} category={category} q={q || undefined} />
          </div>
          <Feed stories={stories} ranked={sort === 'top'} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[640px] border-x border-[var(--line)]">
        <div className="sticky top-14 z-20 border-b border-[var(--line)] bg-black/80 backdrop-blur lg:top-0">
          <h1 className="px-4 pt-3 text-xl font-extrabold text-white">Home</h1>
          <FeedTabs sort={sort} />
        </div>
        <Feed stories={stories} ranked={sort === 'top'} />
      </main>
      <RightRail trending={trending} />
    </div>
  );
}

function FeedHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="sticky top-14 z-20 border-b border-[var(--line)] bg-black/80 px-4 py-2.5 backdrop-blur lg:top-0">
      <h1 className="text-xl font-extrabold text-white">{title}</h1>
      <p className="muted text-[13px]">{subtitle}</p>
    </div>
  );
}

function Feed({ stories, ranked }: { stories: import('@/types').Story[]; ranked: boolean }) {
  if (stories.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-lg font-bold text-white">Nothing here yet</p>
        <p className="muted mt-1 text-sm">
          The ingestion job pulls fresh gaming news every few minutes.
        </p>
      </div>
    );
  }
  return (
    <div>
      {stories.map((s, i) => (
        <PostCard key={s.id} story={s} rank={ranked ? i + 1 : undefined} />
      ))}
    </div>
  );
}
