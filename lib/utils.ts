import { formatDistanceToNowStrict } from 'date-fns';
import type { Category } from '@/types';

/** Minimal className combiner (avoids pulling in clsx/tailwind-merge). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Brand + category colour tokens (from the product spec, §14). */
export const CATEGORY_COLORS: Record<Category, string> = {
  RPG: '#7c3aed',
  FPS: '#dc2626',
  Strategy: '#2563eb',
  Action: '#ea580c',
  Indie: '#16a34a',
  Industry: '#6b7280',
  Hardware: '#0891b2',
  Esports: '#d97706',
};

export const BRAND = '#8b5cf6';

export function categoryColor(category: Category): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Industry;
}

/** "3h", "2d" style relative timestamps. */
export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: false })
      .replace(' seconds', 's')
      .replace(' second', 's')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' months', 'mo')
      .replace(' month', 'mo')
      .replace(' years', 'y')
      .replace(' year', 'y');
  } catch {
    return '';
  }
}

/** 1234 -> "1.2K", 1200000 -> "1.2M". */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Extract a clean "ign.com" style domain from a URL. */
export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
