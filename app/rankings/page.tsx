import { Flame } from 'lucide-react';
import { getStories } from '@/lib/stories';
import { StoryList } from '@/components/feed/StoryList';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Popular — SPAWN' };

export default async function RankingsPage() {
  const stories = await getStories({ sort: 'top', period: '7days', limit: 40 });

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[640px] border-x border-[var(--line)]">
        <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-[var(--line)] bg-black/80 px-4 py-3 backdrop-blur lg:top-0">
          <Flame className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="text-xl font-extrabold text-white">Popular this week</h1>
        </div>
        <StoryList stories={stories} ranked />
      </main>
    </div>
  );
}
