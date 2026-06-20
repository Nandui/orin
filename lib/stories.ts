import 'server-only';
import { getServiceClient } from '@/lib/supabase/server';
import { MOCK_STORIES } from '@/lib/mock';
import type {
  Category,
  Highlight,
  Story,
  StoryQuery,
  StorySort,
} from '@/types';

const STORY_COLUMNS =
  'id, cluster_id, title, url, source_domain, summary, image_url, category, published_at, ai_overview, ai_analysis, ai_sentiment, view_count, like_count, bookmark_count, comment_count, repost_count, score, rank_today, rank_delta, badges, is_trending';

/** Map a raw DB row to the UI `Story` shape, coercing jsonb/bigint fields. */
function rowToStory(row: Record<string, unknown>): Story {
  const num = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0));
  return {
    id: String(row.id),
    cluster_id: (row.cluster_id as string) ?? null,
    title: String(row.title ?? ''),
    url: String(row.url ?? ''),
    source_domain: String(row.source_domain ?? ''),
    summary: (row.summary as string) ?? null,
    image_url: (row.image_url as string) ?? null,
    category: (row.category as Category) ?? 'Industry',
    published_at: String(row.published_at ?? new Date().toISOString()),
    ai_overview: (row.ai_overview as string) ?? null,
    ai_analysis: (row.ai_analysis as Story['ai_analysis']) ?? null,
    ai_sentiment: (row.ai_sentiment as Story['ai_sentiment']) ?? null,
    view_count: num(row.view_count),
    like_count: num(row.like_count),
    bookmark_count: num(row.bookmark_count),
    comment_count: num(row.comment_count),
    repost_count: num(row.repost_count),
    score: num(row.score),
    rank_today: row.rank_today == null ? null : num(row.rank_today),
    rank_delta: num(row.rank_delta),
    badges: (row.badges as Story['badges']) ?? [],
    is_trending: Boolean(row.is_trending),
  };
}

function periodCutoff(period: StoryQuery['period']): number {
  const hours = period === '7days' ? 24 * 7 : period === 'today' ? 24 : Infinity;
  return Date.now() - hours * 3_600_000;
}

function applyMock(query: StoryQuery): Story[] {
  const { sort = 'trending', category = null, period, page = 1, limit = 20 } =
    query;
  const cutoff = periodCutoff(period);
  let rows = MOCK_STORIES.filter(
    (s) => new Date(s.published_at).getTime() >= cutoff,
  );
  if (category) rows = rows.filter((s) => s.category === category);
  rows = sortStories(rows, sort);
  const start = (page - 1) * limit;
  return rows.slice(start, start + limit);
}

function sortStories(rows: Story[], sort: StorySort): Story[] {
  const copy = [...rows];
  if (sort === 'new') {
    copy.sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
  } else if (sort === 'top') {
    copy.sort((a, b) => b.view_count - a.view_count);
  } else {
    // trending: trending flag first, then score
    copy.sort((a, b) => {
      if (a.is_trending !== b.is_trending) return a.is_trending ? -1 : 1;
      return b.score - a.score;
    });
  }
  return copy;
}

/** Paginated, sorted, optionally category-filtered story list. */
export async function getStories(query: StoryQuery = {}): Promise<Story[]> {
  const supabase = getServiceClient();
  if (!supabase) return applyMock(query);

  const { sort = 'trending', category = null, period, page = 1, limit = 20 } =
    query;
  let q = supabase.from('stories').select(STORY_COLUMNS);

  if (category) q = q.eq('category', category);
  if (period && period !== '7days') {
    q = q.gte('published_at', new Date(periodCutoff(period)).toISOString());
  } else if (period === '7days') {
    q = q.gte('published_at', new Date(periodCutoff('7days')).toISOString());
  }

  if (sort === 'new') q = q.order('published_at', { ascending: false });
  else if (sort === 'top') q = q.order('view_count', { ascending: false });
  else q = q.order('is_trending', { ascending: false }).order('score', { ascending: false });

  q = q.range((page - 1) * limit, page * limit - 1);

  const { data, error } = await q;
  if (error || !data || data.length === 0) return applyMock(query);
  return data.map(rowToStory);
}

export async function getStoryById(id: string): Promise<Story | null> {
  const supabase = getServiceClient();
  if (!supabase) {
    return MOCK_STORIES.find((s) => s.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from('stories')
    .select(STORY_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) {
    return MOCK_STORIES.find((s) => s.id === id) ?? null;
  }
  return rowToStory(data as Record<string, unknown>);
}

/** Stories in the same cluster (other outlets covering the same topic). */
export async function getClusterStories(
  clusterId: string | null,
  excludeId: string,
): Promise<Story[]> {
  if (!clusterId) return [];
  const supabase = getServiceClient();
  if (!supabase) {
    return MOCK_STORIES.filter(
      (s) => s.cluster_id === clusterId && s.id !== excludeId,
    );
  }
  const { data } = await supabase
    .from('stories')
    .select(STORY_COLUMNS)
    .eq('cluster_id', clusterId)
    .neq('id', excludeId)
    .limit(8);
  return (data ?? []).map(rowToStory);
}

/** The 4 highlight cards (product spec §8 /api/highlights). */
export async function getHighlights(): Promise<Highlight[]> {
  const pool = await getStories({ sort: 'trending', period: '7days', limit: 60 });
  if (pool.length === 0) return [];

  const byViews = [...pool].sort((a, b) => b.view_count - a.view_count);
  const byComments = [...pool].sort((a, b) => b.comment_count - a.comment_count);
  const byDelta = [...pool].sort((a, b) => b.rank_delta - a.rank_delta);
  const trending = pool.filter((s) => s.is_trending);
  const icymi = (trending.length ? trending : pool).sort(
    (a, b) =>
      new Date(a.published_at).getTime() - new Date(b.published_at).getTime(),
  )[0];

  const highlights: Highlight[] = [
    { kind: 'icymi', label: 'ICYMI', story: icymi },
    { kind: 'most_viewed', label: '#1 Viewed', story: byViews[0] },
    { kind: 'most_debated', label: 'Most Debated', story: byComments[0] },
    { kind: 'fastest_climbing', label: 'Fastest Climbing', story: byDelta[0] },
  ];
  return highlights.filter((h) => h.story);
}

/** Rising stories for the sidebar — trending, by score (spec §8 /api/rising). */
export async function getRising(limit = 6): Promise<Story[]> {
  const pool = await getStories({ sort: 'trending', period: '7days', limit: 40 });
  return pool.filter((s) => s.is_trending).slice(0, limit);
}

/** "Recent Stars" sidebar — highest-engagement stories. */
export async function getStars(limit = 5): Promise<Story[]> {
  const pool = await getStories({ sort: 'top', period: '7days', limit: 40 });
  return [...pool].sort((a, b) => b.like_count - a.like_count).slice(0, limit);
}

export { rowToStory, STORY_COLUMNS };
