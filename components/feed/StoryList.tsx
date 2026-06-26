import type { Story } from '@/types';
import { PostCard } from '@/components/feed/PostCard';
import { EmptyState } from '@/components/feed/EmptyState';

// Feed list used by the section pages (rankings, esports). `ranked` shows a
// position number on each post.
export function StoryList({
  stories,
  ranked = false,
}: {
  stories: Story[];
  ranked?: boolean;
}) {
  if (stories.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        message="Check back soon for the latest."
      />
    );
  }

  return (
    <div>
      {stories.map((story, i) => (
        <PostCard key={story.id} story={story} rank={ranked ? i + 1 : undefined} />
      ))}
    </div>
  );
}
