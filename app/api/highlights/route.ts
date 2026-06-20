import { getHighlights } from '@/lib/stories';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/highlights — the 4 highlight cards (ICYMI, #1 Viewed, Most Debated,
// Fastest Climbing).
export async function GET() {
  const highlights = await getHighlights();
  return json({ highlights });
}
