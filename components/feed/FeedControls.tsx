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

// Sort tabs + category filter row, driven entirely by query params (no client JS).
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
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2">
        {SORTS.map((s) => (
          <Link
            key={s.value}
            href={buildHref({ sort: s.value, category, q })}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              sort === s.value
                ? 'bg-neutral-800 text-white'
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
            'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
            category === null
              ? 'border-neutral-600 bg-neutral-800 text-white'
              : 'border-neutral-800 text-neutral-400 hover:text-white',
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
                'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
                active
                  ? 'text-white'
                  : 'border-neutral-800 text-neutral-400 hover:text-white',
              )}
              style={
                active
                  ? { borderColor: color, backgroundColor: `${color}22`, color }
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
