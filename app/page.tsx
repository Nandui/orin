import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category, Story, StorySort } from '@/types';
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

function readMinutes(story: Story): number {
  const words = (story.summary ?? story.title).split(/\s+/).length;
  return Math.max(2, Math.round(words / 60));
}

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
  const rail = stories.slice(2, 6);
  const popular = stories.slice(6, 16);
  const hot = [...stories].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <div className="flex flex-col gap-10">
      {/* Lead */}
      <section className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        {featured ? <Hero featured={featured} next={stories[1]} /> : null}
        <aside className="flex flex-col gap-4">
          {rail[0] ? <RailLead story={rail[0]} /> : null}
          {rail.slice(1).map((s) => (
            <RailItem key={s.id} story={s} />
          ))}
        </aside>
      </section>

      {/* Latest + rail */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <SectionHeader title="Latest" href="/rankings" />
          {popular.length ? (
            <div className="grid sm:grid-cols-2 sm:gap-x-8">
              {popular.map((s) => (
                <StoryTile key={s.id} story={s} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#141414] p-8 text-center text-sm text-neutral-500 ring-1 ring-white/5">
              No stories yet — the ingestion job will fill this in.
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <Panel title="Trending now">
            {hot.map((s, i) => (
              <div key={s.id} className="flex items-baseline gap-3">
                <span className="font-display text-lg font-bold text-[var(--gold)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/story/${s.id}`}
                    className="line-clamp-2 font-display text-sm font-semibold text-white hover:text-[var(--gold)]"
                  >
                    {s.title}
                  </Link>
                  <p className="kicker mt-0.5 text-[10px] text-neutral-500">
                    {s.source_domain} · {timeAgo(s.published_at)} ago
                  </p>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Releases" count={UPCOMING.length}>
            {UPCOMING.map((r) => (
              <div key={r.title} className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-white/5 leading-none">
                  <span className="text-sm font-bold text-white">{r.day}</span>
                  <span className="text-[10px] text-neutral-500">{r.mon}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-white">
                    {r.title}
                  </p>
                  <p className="text-xs text-neutral-500">{r.sub}</p>
                </div>
              </div>
            ))}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b-2 border-white/15 pb-2">
      <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
      <Link
        href={href}
        className="kicker flex items-center gap-1 text-[10px] font-semibold text-neutral-400 hover:text-white"
      >
        See all <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function RailLead({ story }: { story: Story }) {
  return (
    <Link
      href={`/story/${story.id}`}
      className="group block overflow-hidden rounded-3xl bg-[#141414] ring-1 ring-white/5 transition hover:ring-white/15"
    >
      {story.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.image_url}
          alt=""
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      ) : null}
      <div className="p-4">
        <span
          className="kicker text-[10px] font-bold"
          style={{ color: categoryColor(story.category) }}
        >
          {story.category}
        </span>
        <h3 className="mt-1.5 font-display text-xl font-bold leading-snug text-white group-hover:text-[var(--gold)]">
          {story.title}
        </h3>
        {story.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-400">
            {story.summary}
          </p>
        ) : null}
        <p className="kicker mt-3 text-[10px] text-neutral-500">
          {readMinutes(story)} min read · {timeAgo(story.published_at)} ago
        </p>
      </div>
    </Link>
  );
}

function RailItem({ story }: { story: Story }) {
  return (
    <Link
      href={`/story/${story.id}`}
      className="group flex items-center gap-3 rounded-2xl bg-[#141414] p-2.5 ring-1 ring-white/5 transition hover:ring-white/15"
    >
      <span className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-800">
        {story.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 font-display text-sm font-semibold text-white group-hover:text-[var(--gold)]">
          {story.title}
        </span>
        <span className="kicker mt-1 block text-[10px] text-neutral-500">
          {readMinutes(story)} min read
        </span>
      </span>
    </Link>
  );
}
