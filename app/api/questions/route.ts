import { z } from 'zod';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

const QuestionSchema = z.object({
  story_id: z.string().min(1),
  question: z.string().min(1).max(1000),
});

// POST /api/questions — submit a "Spawn Deeper" question. Auth-gated (Phase 2);
// Pro members optionally get an AI-generated answer.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = QuestionSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: 'invalid_body', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  return json(
    {
      error: 'not_implemented',
      message: 'Questions require authentication — arrives in Phase 2.',
    },
    { status: 501 },
  );
}
