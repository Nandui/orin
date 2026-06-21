// Reddit is queried (read-only, no API key) to find the original discussion
// thread for a story and pull its engagement — Digg-style. Reddit requires a
// descriptive User-Agent; requests degrade gracefully (return null) on any
// error or rate-limit.

const UA = 'web:spawn-gaming-aggregator:0.1 (news aggregator)';

export interface RedditHit {
  score: number;
  comments: number;
  permalink: string; // absolute URL to the thread
  subreddit: string;
  title: string;
}

interface ListingChild {
  data?: {
    score?: number;
    num_comments?: number;
    permalink?: string;
    subreddit?: string;
    title?: string;
    over_18?: boolean;
  };
}

async function redditGet(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function parseListing(data: unknown): RedditHit[] {
  const children = (data as { data?: { children?: ListingChild[] } })?.data
    ?.children;
  if (!Array.isArray(children)) return [];
  const hits: RedditHit[] = [];
  for (const c of children) {
    const d = c?.data;
    if (!d || !d.permalink) continue;
    hits.push({
      score: Number(d.score ?? 0),
      comments: Number(d.num_comments ?? 0),
      permalink: `https://www.reddit.com${d.permalink}`,
      subreddit: String(d.subreddit ?? ''),
      title: String(d.title ?? ''),
    });
  }
  return hits;
}

/**
 * Find the most popular Reddit thread for an article. Tries an exact-URL lookup
 * first, then a title search. Returns the highest-scoring hit, or null.
 */
export async function fetchRedditEngagement(
  articleUrl: string,
  title: string,
): Promise<RedditHit | null> {
  const byUrl = parseListing(
    await redditGet(
      `https://www.reddit.com/api/info.json?url=${encodeURIComponent(articleUrl)}`,
    ),
  );

  let hits = byUrl;
  if (hits.length === 0) {
    // Fall back to a title search (quoted, recent, top).
    const q = encodeURIComponent(`"${title.slice(0, 120)}"`);
    hits = parseListing(
      await redditGet(
        `https://www.reddit.com/search.json?q=${q}&sort=top&t=year&limit=5`,
      ),
    );
  }
  if (hits.length === 0) return null;

  return hits.reduce((best, h) => (h.score > best.score ? h : best));
}

/** Top comment bodies from a thread, for grounding sentiment. Best-effort. */
export async function fetchRedditComments(
  permalink: string,
  limit = 6,
): Promise<string[]> {
  const json = `${permalink.replace(/\/$/, '')}.json?limit=${limit}&sort=top`;
  const data = await redditGet(json);
  if (!Array.isArray(data) || data.length < 2) return [];
  const children = (data[1] as { data?: { children?: ListingChild[] } })?.data
    ?.children;
  if (!Array.isArray(children)) return [];
  const bodies: string[] = [];
  for (const c of children) {
    const body = (c as { data?: { body?: string } })?.data?.body;
    if (body && body !== '[deleted]' && body !== '[removed]') {
      bodies.push(body.slice(0, 400));
    }
    if (bodies.length >= limit) break;
  }
  return bodies;
}
