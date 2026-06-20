import Parser from 'rss-parser';
import type { Category } from '@/types';
import { domainFromUrl } from '@/lib/utils';

// Seed sources (product spec §3.1). Used when the `rss_sources` table is empty
// or Supabase isn't configured.
export interface SourceSeed {
  name: string;
  url: string;
  category: Category;
  homepage: string;
}

export const SEED_SOURCES: SourceSeed[] = [
  { name: 'IGN', url: 'https://feeds.feedburner.com/ign/all', category: 'Industry', homepage: 'ign.com' },
  { name: 'Eurogamer', url: 'https://www.eurogamer.net/feed', category: 'Industry', homepage: 'eurogamer.net' },
  { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', category: 'Industry', homepage: 'pcgamer.com' },
  { name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed', category: 'Indie', homepage: 'rockpapershotgun.com' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss', category: 'Industry', homepage: 'kotaku.com' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', category: 'Industry', homepage: 'polygon.com' },
  { name: 'Gamespot', url: 'https://www.gamespot.com/feeds/news/', category: 'Industry', homepage: 'gamespot.com' },
  { name: 'HLTV', url: 'https://www.hltv.org/rss/news', category: 'Esports', homepage: 'hltv.org' },
  { name: 'Dot Esports', url: 'https://dotesports.com/feed', category: 'Esports', homepage: 'dotesports.com' },
  { name: "Tom's Hardware", url: 'https://www.tomshardware.com/feeds/all', category: 'Hardware', homepage: 'tomshardware.com' },
];

export interface ParsedItem {
  title: string;
  url: string;
  summary: string | null;
  image_url: string | null;
  published_at: string;
  source_domain: string;
}

// Keyword overrides let a source's default category be refined per-headline.
const CATEGORY_KEYWORDS: Array<{ category: Category; words: string[] }> = [
  { category: 'RPG', words: ['rpg', 'final fantasy', 'elden ring', 'baldur', 'persona', 'dragon age', 'witcher'] },
  { category: 'FPS', words: ['call of duty', 'counter-strike', 'valorant', 'doom', 'battlefield', 'halo', 'overwatch'] },
  { category: 'Strategy', words: ['civilization', 'total war', 'age of empires', 'strategy', 'rts'] },
  { category: 'Indie', words: ['indie', 'roguelike', 'pixel'] },
  { category: 'Hardware', words: ['gpu', 'rtx', 'cpu', 'graphics card', 'nvidia', 'amd', 'handheld', 'steam deck'] },
  { category: 'Esports', words: ['esports', 'tournament', 'championship', 'major', 'league'] },
];

export function detectCategory(title: string, fallback: Category): Category {
  const t = title.toLowerCase();
  for (const { category, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return category;
  }
  return fallback;
}

type FeedItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  ['media:content']?: { $?: { url?: string } };
};

function extractImage(item: FeedItem): string | null {
  if (item.enclosure?.url) return item.enclosure.url;
  const media = item['media:content'];
  if (media?.$?.url) return media.$.url;
  // Fall back to the first <img> in the HTML content, if any.
  const html = item.content ?? '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

const parser: Parser<unknown, FeedItem> = new Parser({
  timeout: 10_000,
  headers: { 'User-Agent': 'SpawnBot/0.1 (+https://spawn.gg)' },
  customFields: { item: [['media:content', 'media:content']] },
});

/** Fetch and normalise a single RSS feed. Never throws — returns [] on error. */
export async function fetchFeed(url: string, fallback: Category): Promise<ParsedItem[]> {
  try {
    const feed = await parser.parseURL(url);
    const items = feed.items ?? [];
    const out: ParsedItem[] = [];
    for (const item of items) {
      const link = item.link?.trim();
      const title = item.title?.trim();
      if (!link || !title) continue;
      out.push({
        title,
        url: link,
        summary: (item.contentSnippet ?? '').trim().slice(0, 600) || null,
        image_url: extractImage(item),
        published_at: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source_domain: domainFromUrl(link),
      });
    }
    return out;
  } catch {
    return [];
  }
}
