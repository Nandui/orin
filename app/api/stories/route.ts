import { getStories } from '@/lib/stories';
import { json } from '@/lib/api';
import { CATEGORIES, type Category, type StorySort } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/stories?sort=trending|new|top&category=RPG&period=today|7days&page=1&limit=20
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const sortParam = searchParams.get('sort');
  const sort: StorySort = (['trending', 'new', 'top'] as StorySort[]).includes(
    sortParam as StorySort,
  )
    ? (sortParam as StorySort)
    : 'trending';

  const catParam = searchParams.get('category');
  const category: Category | null = CATEGORIES.includes(catParam as Category)
    ? (catParam as Category)
    : null;

  const period = searchParams.get('period') === 'today' ? 'today' : '7days';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));

  const stories = await getStories({ sort, category, period, page, limit });
  return json({ stories, page, limit, count: stories.length });
}
