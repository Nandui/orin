import type { Category } from '@/types';
import { categoryColor } from '@/lib/utils';

export function CategoryPill({ category }: { category: Category }) {
  const color = categoryColor(category);
  return (
    <span
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {category}
    </span>
  );
}
