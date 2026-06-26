'use client';

import { useRouter } from 'next/navigation';
import { Tabs } from '@base-ui-components/react/tabs';
import type { Category, StorySort } from '@/types';

const TABS: { value: StorySort; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'new', label: 'Latest' },
  { value: 'top', label: 'Top' },
];

// Feed sort, as X-style tabs. Driven by Base UI Tabs; selecting a tab performs a
// real navigation so the server re-fetches the feed in the new order.
export function FeedTabs({
  sort,
  category,
  q,
}: {
  sort: StorySort;
  category?: Category | null;
  q?: string;
}) {
  const router = useRouter();

  function href(value: string): string {
    const sp = new URLSearchParams();
    if (value !== 'trending') sp.set('sort', value);
    if (category) sp.set('category', category);
    if (q) sp.set('q', q);
    const s = sp.toString();
    return s ? `/?${s}` : '/';
  }

  return (
    <Tabs.Root value={sort} onValueChange={(v) => router.push(href(String(v)))}>
      <Tabs.List className="flex">
        {TABS.map((t) => (
          <Tabs.Tab
            key={t.value}
            value={t.value}
            className="group relative flex-1 cursor-pointer px-4 py-3.5 text-[15px] font-semibold text-neutral-500 outline-none transition-colors hover:bg-white/[0.03] aria-selected:text-white"
          >
            {t.label}
            <span className="absolute inset-x-0 bottom-0 mx-auto hidden h-1 w-14 rounded-full bg-[var(--accent)] group-aria-selected:block" />
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
