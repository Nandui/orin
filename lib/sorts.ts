import type { StorySort } from '@/types';

// Single source of truth for the feed sort options, so the label for a given
// sort can't drift between the home tabs and the filtered-view controls.
export const SORTS: { value: StorySort; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'new', label: 'Latest' },
  { value: 'top', label: 'Top' },
];
