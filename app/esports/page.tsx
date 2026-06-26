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
    limit: 30,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-2 border-b-2 border-white/15 pb-3">
        <Gamepad2 className="h-5 w-5 text-[var(--gold)]" />
        <h1 className="font-display text-3xl font-bold text-white">Esports</h1>
      </div>
      <StoryList stories={stories} />
    </div>
  );
}
