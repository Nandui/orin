import { Trophy } from 'lucide-react';
import { getStories } from '@/lib/stories';
import { StoryList } from '@/components/feed/StoryList';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Rankings — SPAWN' };

export default async function RankingsPage() {
  const stories = await getStories({ sort: 'top', period: '7days', limit: 30 });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[#ff2d4d]" />
        <h1 className="font-display text-2xl font-bold uppercase text-white">
          Top Stories This Week
        </h1>
      </div>
      <StoryList stories={stories} />
    </div>
  );
}
