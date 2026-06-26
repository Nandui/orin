import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category, StorySort } from '@/types';
import { CATEGORIES } from '@/types';
import { getRising, getStories } from '@/lib/stories';
import { categoryColor, timeAgo } from '@/lib/utils';
import { Hero } from '@/components/feed/Hero';
import { StoryTile } from '@/components/feed/StoryTile';
import { Panel } from '@/components/feed/Panel';
import { FeedControls } from '@/components/feed/FeedControls';
import { StoryList } from '@/components/feed/StoryList';

export const dynamic = 'force-dynamic';

const SORTS: StorySort[] = ['trending', 'new', 'top'];

const UPCOMING = [
  { day: '12', mon: 'APR', title: 'GTA VI', sub: 'PS5 · Xbox Series' },
  { day: '24', mon: 'APR', title: 'Hollow Knight: Silksong', sub: 'All platforms' },
  { day: '30', mon: 'APR', title: 'Civilization VII — Naval', sub: 'PC' },
];

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
    getRising(5),
  ]);

  const stories = q
    ? storiesRaw.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))
    : storiesRaw;

  // Filtered / search view.
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

  const featured = stories[0];
  const side = stories.slice(1, 5);
  const popular = stories.slice(5, 13);
  const hot = [...stories].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* Main column */}
      <div className="min-w-0">
        {featured ? <Hero featured={featured} side={side} /> : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Popular Stories</h2>
            <Link
              href="/rankings"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {popular.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {popular.map((s) => (
                <StoryTile key={s.id} story={s} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#141417] p-8 text-center text-sm text-neutral-500 ring-1 ring-white/5">
              No stories yet — the ingestion cron will fill this in.
            </div>
          )}
        </section>
      </div>

      {/* Right rail */}
      <aside className="flex flex-col gap-5">
        <Panel title="Rising" count={rising.length}>
          {rising.length ? (
            rising.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <Avatar story={s} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/story/${s.id}`}
                    className="line-clamp-1 text-sm font-semibold text-white hover:text-[#8fb0ff]"
                  >
                    {s.title}
                  </Link>
                  <p className="text-xs text-neutral-500">
                    {s.source_domain} · {timeAgo(s.published_at)} ago
                  </p>
                </div>
                <Link
                  href={`/story/${s.id}`}
                  className="shrink-0 text-xs font-semibold text-[#4d83ff]"
                >
                  VIEW
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500">Nothing rising right now.</p>
          )}
        </Panel>

        <Panel title="Releases" count={UPCOMING.length}>
          {UPCOMING.map((r) => (
            <div key={r.title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white/5 leading-none">
                <span className="text-sm font-bold text-white">{r.day}</span>
                <span className="text-[10px] text-neutral-500">{r.mon}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {r.title}
                </p>
                <p className="text-xs text-neutral-500">{r.sub}</p>
              </div>
              <Link
                href="/releases"
                className="shrink-0 text-xs font-semibold text-[#4d83ff]"
              >
                VIEW
              </Link>
            </div>
          ))}
        </Panel>

        <Panel title="Trending now">
          {hot.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <Avatar story={s} live />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/story/${s.id}`}
                  className="line-clamp-1 text-sm font-semibold text-white hover:text-[#8fb0ff]"
                >
                  {s.title}
                </Link>
                <p className="flex items-center gap-1.5 text-xs text-[#ef4444]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                  {s.source_domain} · {timeAgo(s.published_at)} ago
                </p>
              </div>
              <Link
                href={`/story/${s.id}`}
                className="shrink-0 text-xs font-semibold text-[#4d83ff]"
              >
                VIEW
              </Link>
            </div>
          ))}
        </Panel>
      </aside>
    </div>
  );
}

function Avatar({
  story,
  live,
}: {
  story: { image_url: string | null; category: Category };
  live?: boolean;
}) {
  const color = categoryColor(story.category);
  return (
    <span className="relative shrink-0">
      <span
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold ring-1 ring-white/10"
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
      <span
        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[#141417] ${
          live ? 'bg-[#ef4444]' : 'bg-green-500'
        }`}
      />
    </span>
  );
}
