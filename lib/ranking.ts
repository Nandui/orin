import type { Story } from '@/types';

/**
 * Decay-weighted engagement score (product spec §7.4).
 *
 * Newer stories with strong engagement rank highest; the denominator decays
 * the score as the story ages so the feed stays fresh.
 */
export function computeScore(story: {
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  view_count: number;
  repost_count: number;
  published_at: string;
}): number {
  const ageHours =
    (Date.now() - new Date(story.published_at).getTime()) / 3_600_000;

  const engagement =
    story.like_count * 3 +
    story.comment_count * 5 +
    story.bookmark_count * 2 +
    story.view_count * 0.001 +
    story.repost_count * 1.5;

  return engagement / Math.pow(Math.max(ageHours, 0) + 2, 1.8);
}

/**
 * Given stories with a previous rank, recompute scores and assign
 * `rank_today` + `rank_delta` (positive delta = climbing).
 */
export function rankStories(
  stories: Array<
    Pick<
      Story,
      | 'id'
      | 'like_count'
      | 'comment_count'
      | 'bookmark_count'
      | 'view_count'
      | 'repost_count'
      | 'published_at'
      | 'rank_today'
    >
  >,
): Array<{ id: string; score: number; rank_today: number; rank_delta: number }> {
  const scored = stories
    .map((s) => ({ id: s.id, prev: s.rank_today, score: computeScore(s) }))
    .sort((a, b) => b.score - a.score);

  return scored.map((s, i) => {
    const rank = i + 1;
    // Previous rank null (new story) => no delta.
    const delta = s.prev == null ? 0 : s.prev - rank;
    return { id: s.id, score: s.score, rank_today: rank, rank_delta: delta };
  });
}
