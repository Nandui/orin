import { getClusterStories, getStoryById } from '@/lib/stories';
import { incrementView } from '@/lib/redis';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/stories/:id — full story + cluster siblings. Side effect: bumps the
// Redis view counter (product spec §8).
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const story = await getStoryById(id);
  if (!story) return json({ error: 'not_found' }, { status: 404 });

  void incrementView(id);
  const cluster = await getClusterStories(story.cluster_id, story.id);

  return json({ story, cluster });
}
