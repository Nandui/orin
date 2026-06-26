import Link from 'next/link';
import { CATEGORIES, type Category, type StorySort } from '@/types';
import { cn, categoryColor } from '@/lib/utils';

const SORTS: { label: string; value: StorySort }[] = [
  { label: 'Trending', value: 'trending' },
  { label: 'New', value: 'new' },
  { label: 'Top', value: 'top' },
];

function buildHref(params: {
  sort?: StorySort;
  category?: Category | null;
  q?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.sort && params.sort !== 'trending') sp.set('sort', params.sort);
  if (params.category) sp.set('category', params.category);
  if (params.q) sp.set('q', params.q);
  const qs = sp.toString();
  return qs ? `/?${qs}` : '/';
}

// Sort tabs + category filter row, driven entirely by query params (no JS).
export function FeedControls({
  sort,
  category,
  q,
}: {
  sort: StorySort;
  category: Category | null;
  q?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex items-center gap-1.5 rounded-full bg-[#16181c] p-1 ring-1 ring-white/5 sm:w-fit">
        {SORTS.map((s) => (
          <Link
            key={s.value}
            href={buildHref({ sort: s.value, category, q })}
            className={cn(
              'flex-1 rounded-full px-4 py-1.5 text-center text-sm font-semibold transition-colors sm:flex-none',
              sort === s.value
                ? 'bg-[var(--accent)] text-white'
                : 'text-neutral-400 hover:text-white',
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={buildHref({ sort, category: null, q })}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
            category === null
              ? 'bg-white/10 text-white'
              : 'text-neutral-500 hover:text-white',
          )}
        >
          All
        </Link>
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          const color = categoryColor(cat);
          return (
            <Link
              key={cat}
              href={buildHref({ sort, category: cat, q })}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                active ? 'text-white' : 'text-neutral-500 hover:text-white',
              )}
              style={
                active
                  ? { backgroundColor: `${color}26`, color }
                  : undefined
              }
            >
              {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
