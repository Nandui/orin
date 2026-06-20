import { getStories } from '@/lib/stories';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/search?q=elden — naive title search over the recent feed window.
// (Full-text search via Postgres is a later enhancement.)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  if (!q) return json({ results: [], q: '' });

  const pool = await getStories({ sort: 'new', period: '7days', limit: 50 });
  const results = pool.filter((s) => s.title.toLowerCase().includes(q));
  return json({ results, q, count: results.length });
}
