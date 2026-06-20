import { Redis } from '@upstash/redis';

// Upstash Redis is used to hot-count views without hammering Postgres. All
// helpers no-op gracefully when Redis isn't configured.

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    cached = null;
    return cached;
  }

  cached = new Redis({ url, token });
  return cached;
}

const VIEW_KEY = (storyId: string) => `story:views:${storyId}`;

/** Increment the hot view counter for a story. Returns the new count, or null. */
export async function incrementView(storyId: string): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.incr(VIEW_KEY(storyId));
  } catch {
    return null;
  }
}

/** Read the pending (un-flushed) view count for a story. */
export async function getPendingViews(storyId: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    const v = await redis.get<number>(VIEW_KEY(storyId));
    return v ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Drain all pending `story:views:*` counters. Returns a map of storyId -> delta
 * and clears the keys. Called from the rank cron to flush hot counts into the DB.
 */
export async function drainViewCounters(): Promise<Record<string, number>> {
  const redis = getRedis();
  if (!redis) return {};
  const out: Record<string, number> = {};
  try {
    const keys = await redis.keys('story:views:*');
    if (!keys.length) return out;
    const values = await redis.mget<number[]>(...keys);
    keys.forEach((key, i) => {
      const id = key.replace('story:views:', '');
      const v = values[i];
      if (v && v > 0) out[id] = Number(v);
    });
    if (keys.length) await redis.del(...keys);
  } catch {
    // ignore — flushing is best-effort
  }
  return out;
}

// --- Redis-backed ingestion queues (used by the clustering/analysis crons). ---

export const QUEUE_CLUSTER = 'stories:pending_cluster';
export const QUEUE_ANALYSIS = 'stories:pending_analysis';

export async function enqueue(queue: string, id: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.rpush(queue, id);
  } catch {
    /* ignore */
  }
}

/** Pop up to `count` ids from the head of a queue. */
export async function dequeue(queue: string, count: number): Promise<string[]> {
  const redis = getRedis();
  if (!redis) return [];
  const ids: string[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const id = await redis.lpop<string>(queue);
      if (!id) break;
      ids.push(id);
    }
  } catch {
    /* ignore */
  }
  return ids;
}
