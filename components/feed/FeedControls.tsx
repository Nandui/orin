import Link from 'next/link';
import { CATEGORIES, type Category, type StorySort } from '@/types';
import { cn, categoryColor } from '@/lib/utils';

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

// Category filter row (chips). Sort is handled by the shared FeedTabs; this is
// purely topic filtering, preserving the current sort + query.
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
    <div className="flex gap-1.5 overflow-x-auto px-4 py-2">
      <Link
        href={buildHref({ sort, category: null, q })}
        className={cn(
          'shrink-0 rounded-full px-3 py-1 text-sm font-semibold transition-colors',
          category === null
            ? 'bg-white/10 text-white'
            : 'text-neutral-400 hover:bg-white/5 hover:text-white',
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
              'shrink-0 rounded-full px-3 py-1 text-sm font-semibold transition-colors',
              active ? '' : 'text-neutral-400 hover:bg-white/5 hover:text-white',
            )}
            style={active ? { backgroundColor: `${color}26`, color } : undefined}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
