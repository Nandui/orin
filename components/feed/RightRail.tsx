import Link from 'next/link';
import { Search, TrendingUp } from 'lucide-react';
import type { Story } from '@/types';
import { CATEGORIES } from '@/types';
import { categoryColor, timeAgo } from '@/lib/utils';
import { AdSlot } from '@/components/layout/AdSlot';

const UPCOMING = [
  { title: 'GTA VI', when: 'Q4 2026' },
  { title: 'Hollow Knight: Silksong', when: 'Out now' },
  { title: 'The Elder Scrolls VI', when: 'TBA' },
];

// X-style right column: search, trending stories, topics, and releases. Every
// item links somewhere real.
export function RightRail({ trending }: { trending: Story[] }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[330px] shrink-0 overflow-y-auto px-5 py-4 xl:block">
      <form action="/" method="get" className="mb-4">
        <div className="flex items-center gap-2 rounded-full bg-[#16181c] px-4 py-2.5 ring-1 ring-transparent focus-within:ring-[var(--accent)]">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            name="q"
            placeholder="Search SPAWN"
            className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </form>

      <section className="mb-4 rounded-2xl bg-[#16181c]">
        <h2 className="flex items-center gap-2 px-4 pt-3 text-lg font-extrabold text-white">
          <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
          Trending now
        </h2>
        <div className="mt-1">
          {trending.length ? (
            trending.map((s, i) => (
              <Link
                key={s.id}
                href={`/story/${s.id}`}
                className="block px-4 py-2.5 transition-colors hover:bg-white/[0.03]"
              >
                <p className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[var(--accent)]">#{i + 1}</span>
                  <span
                    className="font-bold uppercase tracking-wide"
                    style={{ color: categoryColor(s.category) }}
                  >
                    {s.category}
                  </span>
                  <span className="muted">· {timeAgo(s.published_at)}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white">
                  {s.title}
                </p>
                <p className="muted mt-0.5 text-xs">{s.source_domain}</p>
              </Link>
            ))
          ) : (
            <p className="muted px-4 pb-3 text-sm">Nothing trending yet.</p>
          )}
        </div>
      </section>

      <section className="mb-4 rounded-2xl bg-[#16181c] p-4">
        <h2 className="mb-2 text-lg font-extrabold text-white">Topics</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/?category=${cat}`}
              className="rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:brightness-110"
              style={{
                backgroundColor: `${categoryColor(cat)}1f`,
                color: categoryColor(cat),
              }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-2xl bg-[#16181c] p-4">
        <h2 className="mb-2 text-lg font-extrabold text-white">Upcoming</h2>
        <ul className="flex flex-col gap-2">
          {UPCOMING.map((r) => (
            <li key={r.title} className="flex items-center justify-between gap-2">
              <Link
                href="/releases"
                className="truncate text-sm font-semibold text-neutral-200 hover:text-white"
              >
                {r.title}
              </Link>
              <span className="muted shrink-0 text-xs">{r.when}</span>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="sidebar" />
    </aside>
  );
}
