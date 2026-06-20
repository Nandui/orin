import { z } from 'zod';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

const VoteSchema = z.object({
  story_id: z.string().min(1),
  type: z.enum(['like', 'bookmark']),
});

// POST/DELETE /api/votes — upsert/remove a like or bookmark.
// Requires authentication, which lands in Phase 2; the body is validated now so
// the contract is stable for the client.
async function handle(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: 'invalid_body', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  return json(
    {
      error: 'not_implemented',
      message: 'Voting requires authentication — arrives in Phase 2.',
    },
    { status: 501 },
  );
}

export const POST = handle;
export const DELETE = handle;
