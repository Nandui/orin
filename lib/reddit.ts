// Reddit lookup for a story's original discussion (Digg-style engagement).
//
// Reddit 403s anonymous requests from datacenter IPs (e.g. Vercel), so set
// REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET (a free "script" app) to use the
// authenticated read-only API via oauth.reddit.com. Without creds it falls back
// to the public endpoints (which usually get blocked in production) and logs
// the HTTP status so the block is visible.

const UA = 'web:spawn-gaming-aggregator:0.2 (gaming news aggregator)';
const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

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
  };
}

// --- app-only OAuth token (cached per warm instance) ---
let cachedToken: { value: string; exp: number } | null = null;

async function getToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null;
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) {
    return cachedToken.value;
  }
  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        authorization: `Basic ${basic}`,
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': UA,
      },
      body: 'grant_type=client_credentials&scope=read',
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn('[reddit] token HTTP', res.status);
      return null;
    }
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    cachedToken = {
      value: data.access_token,
      exp: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return cachedToken.value;
  } catch {
    console.warn('[reddit] token fetch failed');
    return null;
  }
}

async function redditGet(
  endpoint: string,
  params: Record<string, string>,
): Promise<unknown | null> {
  const token = await getToken();
  const qs = new URLSearchParams(params).toString();
  const url = token
    ? `https://oauth.reddit.com${endpoint}?${qs}`
    : `https://www.reddit.com${endpoint.replace(/\/$/, '')}.json?${qs}`;

  const headers: Record<string, string> = {
    'user-agent': UA,
    accept: 'application/json',
  };
  if (token) headers.authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) {
      console.warn('[reddit] HTTP', res.status, token ? 'oauth' : 'anon', endpoint);
      return null;
    }
    return await res.json();
  } catch {
    console.warn('[reddit] fetch error', endpoint);
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

// --- title token overlap, to avoid false matches on the title search ---
const STOP = new Set([
  'the', 'a', 'an', 'and', 'for', 'with', 'from', 'this', 'that', 'into',
  'new', 'now', 'gets', 'will', 'are', 'game', 'games', 'gaming', 'all',
  'out', 'how', 'why', 'what', 'your', 'you', 'here', 'first',
]);

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
}

function overlap(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  let n = 0;
  for (const w of ta) if (tb.has(w)) n += 1;
  return n;
}

/** Find the most popular Reddit thread for an article. */
export async function fetchRedditEngagement(
  articleUrl: string,
  title: string,
): Promise<RedditHit | null> {
  // 1. Exact-URL submissions.
  const byUrl = parseListing(await redditGet('/api/info', { url: articleUrl }));
  if (byUrl.length) {
    return byUrl.reduce((best, h) => (h.score > best.score ? h : best));
  }

  // 2. Title search, filtered to hits that actually share the headline's words.
  const hits = parseListing(
    await redditGet('/search', {
      q: title.slice(0, 200),
      sort: 'top',
      t: 'year',
      limit: '8',
    }),
  );
  const relevant = hits.filter((h) => overlap(title, h.title) >= 2);
  if (!relevant.length) return null;
  return relevant.reduce((best, h) => (h.score > best.score ? h : best));
}

/** Top comment bodies from a thread, for grounding sentiment. Best-effort. */
export async function fetchRedditComments(
  permalink: string,
  limit = 6,
): Promise<string[]> {
  let path: string;
  try {
    path = new URL(permalink).pathname;
  } catch {
    return [];
  }
  const data = await redditGet(path, { limit: String(limit), sort: 'top' });
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
