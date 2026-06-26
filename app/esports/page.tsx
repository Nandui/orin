import { Gamepad2 } from 'lucide-react';
import { getStories } from '@/lib/stories';
import { StoryList } from '@/components/feed/StoryList';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Esports — SPAWN' };

export default async function EsportsPage() {
  const stories = await getStories({
    sort: 'trending',
    category: 'Esports',
    period: '7days',
    limit: 40,
  });

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[640px] border-x border-[var(--line)]">
        <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-[var(--line)] bg-black/80 px-4 py-3 backdrop-blur lg:top-0">
          <Gamepad2 className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="text-xl font-extrabold text-white">Esports</h1>
        </div>
        <StoryList stories={stories} />
      </main>
    </div>
  );
}
