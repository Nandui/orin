import { getRising } from '@/lib/stories';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/rising — trending stories for the sidebar.
export async function GET() {
  const stories = await getRising(8);
  return json({ stories });
}
