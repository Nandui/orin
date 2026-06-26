import { CalendarDays } from 'lucide-react';

export const metadata = { title: 'Releases — SPAWN' };

// Static placeholder. The data-driven releases calendar is a later deliverable
// (product spec §11).
const UPCOMING = [
  { title: 'GTA VI', date: 'Q4 2026', platform: 'PS5 · Xbox Series' },
  { title: 'Hollow Knight: Silksong', date: 'Out now', platform: 'All platforms' },
  { title: 'Civilization VII — Naval', date: 'Spring 2026', platform: 'PC' },
  { title: 'The Elder Scrolls VI', date: 'TBA', platform: 'PC · Xbox' },
];

export default function ReleasesPage() {
  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[640px] border-x border-[var(--line)]">
        <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-[var(--line)] bg-black/80 px-4 py-3 backdrop-blur lg:top-0">
          <CalendarDays className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="text-xl font-extrabold text-white">Release calendar</h1>
        </div>
        <p className="muted px-4 py-3 text-sm">
          A data-driven calendar is on the roadmap. Here&apos;s what&apos;s on the
          horizon.
        </p>
        <ul>
          {UPCOMING.map((r) => (
            <li
              key={r.title}
              className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-4"
            >
              <span className="font-semibold text-neutral-100">{r.title}</span>
              <span className="text-right text-xs">
                <span className="block font-semibold text-[var(--accent)]">
                  {r.date}
                </span>
                <span className="muted">{r.platform}</span>
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
