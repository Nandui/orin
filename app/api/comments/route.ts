import { z } from 'zod';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

const CommentSchema = z.object({
  story_id: z.string().min(1),
  content: z.string().min(1).max(4000),
  parent_id: z.string().nullable().optional(),
});

// POST /api/comments — create a comment. Auth-gated (Phase 2).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: 'invalid_body', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  return json(
    {
      error: 'not_implemented',
      message: 'Commenting requires authentication — arrives in Phase 2.',
    },
    { status: 501 },
  );
}
