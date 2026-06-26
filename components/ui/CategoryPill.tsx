import type { Category } from '@/types';
import { categoryColor } from '@/lib/utils';

export function CategoryPill({ category }: { category: Category }) {
  const color = categoryColor(category);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {category}
    </span>
  );
}
