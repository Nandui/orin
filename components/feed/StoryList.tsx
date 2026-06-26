import type { Story } from '@/types';
import { PostCard } from '@/components/feed/PostCard';

// Feed list used by the section pages (rankings, esports, search). `ranked`
// shows a position number on each post.
export function StoryList({
  stories,
  ranked = false,
}: {
  stories: Story[];
  ranked?: boolean;
}) {
  if (stories.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-lg font-bold text-white">Nothing here yet</p>
        <p className="muted mt-1 text-sm">
          The ingestion job will fill this in shortly.
        </p>
      </div>
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
