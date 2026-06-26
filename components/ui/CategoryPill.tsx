import type { Category } from '@/types';
import { categoryColor } from '@/lib/utils';

export function CategoryPill({ category }: { category: Category }) {
  const color = categoryColor(category);
  return (
    <span
      className="kicker inline-flex items-center text-[10px] font-bold"
      style={{ color }}
    >
      {category}
    </span>
  );
}
