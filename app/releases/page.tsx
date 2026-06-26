import { CalendarDays } from 'lucide-react';

export const metadata = { title: 'Releases — SPAWN' };

// Static placeholder. The data-driven releases calendar is a Phase 3 deliverable
// (product spec §11).
const UPCOMING = [
  { title: 'GTA VI', date: 'Q4 2026', platform: 'PS5 · Xbox Series' },
  { title: 'Hollow Knight: Silksong', date: 'Out now', platform: 'All platforms' },
  { title: 'Civilization VII — Naval', date: 'Spring 2026', platform: 'PC' },
  { title: 'The Elder Scrolls VI', date: 'TBA', platform: 'PC · Xbox' },
];

export default function ReleasesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-2 border-b-2 border-white/15 pb-3">
        <CalendarDays className="h-5 w-5 text-[var(--gold)]" />
        <h1 className="font-display text-3xl font-bold text-white">
          Release calendar
        </h1>
      </div>
      <p className="mb-5 text-sm text-neutral-400">
        A data-driven release calendar arrives in Phase 3. Here&apos;s a preview
        of what&apos;s on the horizon.
      </p>
      <ul className="flex flex-col gap-2">
        {UPCOMING.map((r) => (
          <li
            key={r.title}
            className="flex items-center justify-between rounded-xl bg-[#151517] px-4 py-3 ring-1 ring-white/5"
          >
            <span className="font-semibold text-neutral-100">{r.title}</span>
            <span className="text-right text-xs text-neutral-500">
              <span className="block font-medium text-neutral-300">{r.date}</span>
              {r.platform}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
