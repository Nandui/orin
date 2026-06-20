import { getServiceClient } from '@/lib/supabase/server';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/comments/:storyId — threaded comments for a story (read is public).
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storyId: string }> },
) {
  const { storyId } = await ctx.params;
  const supabase = getServiceClient();
  if (!supabase) return json({ comments: [] });

  const { data, error } = await supabase
    .from('comments')
    .select('id, story_id, parent_id, content, sentiment, like_count, created_at')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return json({ comments: [] });
  return json({ comments: data ?? [] });
}
