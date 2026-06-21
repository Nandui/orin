import type { Story } from '@/types';

// Seeded demo content. SPAWN serves these when Supabase isn't configured so the
// feed, highlights, rankings and detail pages all render out of the box — useful
// for the first Vercel deploy before the ingestion pipeline has data.

const HOUR = 3_600_000;
const now = Date.now();
const ago = (hours: number) => new Date(now - hours * HOUR).toISOString();

function img(seed: string): string {
  return `https://picsum.photos/seed/${seed}/640/360`;
}

interface Seed {
  title: string;
  url: string;
  source_domain: string;
  summary: string;
  category: Story['category'];
  hours: number;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  reposts: number;
  delta: number;
  trending?: boolean;
  badges?: Story['badges'];
  ai?: boolean;
}

const SEEDS: Seed[] = [
  {
    title: 'FromSoftware confirms Elden Ring sequel is in active development',
    url: 'https://www.ign.com/articles/elden-ring-sequel',
    source_domain: 'ign.com',
    summary:
      'Hidetaka Miyazaki tells investors the studio has multiple projects underway, including a follow-up set in the Lands Between.',
    category: 'RPG',
    hours: 2,
    views: 184_200,
    likes: 9_840,
    comments: 1_320,
    bookmarks: 4_010,
    reposts: 880,
    delta: 4,
    trending: true,
    badges: [{ label: 'BREAKING', bg: '#7c3aed', color: '#ffffff' }],
    ai: true,
  },
  {
    title: 'Valorant Champions 2026 viewership shatters esports records',
    url: 'https://dotesports.com/valorant/champions-2026-viewership',
    source_domain: 'dotesports.com',
    summary:
      'Riot reports a 3.1M concurrent peak across the grand final, the largest audience for any tactical shooter event to date.',
    category: 'Esports',
    hours: 4,
    views: 142_900,
    likes: 6_220,
    comments: 980,
    bookmarks: 2_140,
    reposts: 1_500,
    delta: 2,
    trending: true,
    badges: [{ label: 'TRENDING', bg: '#d97706', color: '#ffffff' }],
  },
  {
    title: "NVIDIA's RTX 5090 Super leaks point to a 32GB monster",
    url: 'https://www.tomshardware.com/pc-components/gpus/rtx-5090-super-leak',
    source_domain: 'tomshardware.com',
    summary:
      'New shipping manifests suggest a refreshed flagship with more VRAM and a higher power envelope ahead of CES.',
    category: 'Hardware',
    hours: 5,
    views: 98_400,
    likes: 4_010,
    comments: 760,
    bookmarks: 1_980,
    reposts: 410,
    delta: -1,
    trending: true,
    ai: true,
  },
  {
    title: 'Counter-Strike 2 major operation adds Subtick rework and new map',
    url: 'https://www.hltv.org/news/cs2-operation-subtick',
    source_domain: 'hltv.org',
    summary:
      'Valve ships a long-requested netcode overhaul alongside a competitive map pool shuffle.',
    category: 'FPS',
    hours: 6,
    views: 76_500,
    likes: 5_320,
    comments: 1_540,
    bookmarks: 990,
    reposts: 620,
    delta: 6,
    trending: true,
  },
  {
    title: 'Hollow Knight: Silksong gets a surprise shadow-drop on all platforms',
    url: 'https://www.rockpapershotgun.com/silksong-shadow-drop',
    source_domain: 'rockpapershotgun.com',
    summary:
      'Team Cherry ends the wait with no warning — the sequel is out now, day one on Game Pass.',
    category: 'Indie',
    hours: 7,
    views: 210_300,
    likes: 14_100,
    comments: 2_980,
    bookmarks: 6_700,
    reposts: 2_240,
    delta: 9,
    trending: true,
    badges: [{ label: 'OUT NOW', bg: '#16a34a', color: '#ffffff' }],
    ai: true,
  },
  {
    title: 'Civilization VII first expansion adds a full naval warfare layer',
    url: 'https://www.pcgamer.com/civilization-vii-naval-expansion',
    source_domain: 'pcgamer.com',
    summary:
      'Firaxis details a meaty add-on with new civs, a reworked diplomacy screen and ocean control mechanics.',
    category: 'Strategy',
    hours: 9,
    views: 54_200,
    likes: 2_410,
    comments: 540,
    bookmarks: 1_220,
    reposts: 180,
    delta: 0,
  },
  {
    title: 'GTA VI delayed to Q4 2026, Rockstar cites "polish and scope"',
    url: 'https://www.eurogamer.net/gta-vi-delay',
    source_domain: 'eurogamer.net',
    summary:
      'Take-Two confirms the slip in an earnings call, pushing the year\'s biggest release into the holiday window.',
    category: 'Industry',
    hours: 10,
    views: 320_800,
    likes: 11_900,
    comments: 4_210,
    bookmarks: 3_300,
    reposts: 3_900,
    delta: -3,
    trending: true,
    badges: [{ label: 'DELAY', bg: '#dc2626', color: '#ffffff' }],
    ai: true,
  },
  {
    title: 'Helldivers 2 cross-progression finally arrives in new patch',
    url: 'https://kotaku.com/helldivers-2-cross-progression',
    source_domain: 'kotaku.com',
    summary:
      'Arrowhead delivers the most-requested feature, letting players carry loadouts between PC and PS5.',
    category: 'Action',
    hours: 12,
    views: 61_400,
    likes: 3_880,
    comments: 720,
    bookmarks: 1_410,
    reposts: 360,
    delta: 1,
  },
  {
    title: 'Baldur\'s Gate 3 mod tools enter open beta with full scripting',
    url: 'https://www.polygon.com/baldurs-gate-3-mod-tools',
    source_domain: 'polygon.com',
    summary:
      'Larian opens its in-house toolkit to creators, promising Steam Workshop support across platforms.',
    category: 'RPG',
    hours: 14,
    views: 47_900,
    likes: 3_120,
    comments: 610,
    bookmarks: 2_030,
    reposts: 240,
    delta: 2,
  },
  {
    title: 'Steam Deck 2 reportedly targeting a 2027 launch with OLED standard',
    url: 'https://www.tomshardware.com/steam-deck-2-rumor',
    source_domain: 'tomshardware.com',
    summary:
      'Valve engineers hint at a generational leap in efficiency rather than a yearly refresh cycle.',
    category: 'Hardware',
    hours: 16,
    views: 88_700,
    likes: 4_460,
    comments: 1_020,
    bookmarks: 2_600,
    reposts: 510,
    delta: -2,
  },
  {
    title: 'Overwatch 2 announces a return to 6v6 as the permanent format',
    url: 'https://www.gamespot.com/overwatch-2-6v6-permanent',
    source_domain: 'gamespot.com',
    summary:
      'Blizzard reverses course after extended community testing, reinstating the second tank slot for good.',
    category: 'FPS',
    hours: 18,
    views: 72_100,
    likes: 5_010,
    comments: 1_870,
    bookmarks: 1_120,
    reposts: 700,
    delta: 3,
  },
  {
    title: 'Indie roguelike "Ember Drift" sells a million copies in a week',
    url: 'https://www.rockpapershotgun.com/ember-drift-million',
    source_domain: 'rockpapershotgun.com',
    summary:
      'A two-person team\'s deckbuilder becomes the surprise breakout hit of the season.',
    category: 'Indie',
    hours: 20,
    views: 39_500,
    likes: 2_780,
    comments: 430,
    bookmarks: 1_640,
    reposts: 290,
    delta: 5,
  },
  {
    title: 'Microsoft restructures Xbox studios after record quarter',
    url: 'https://www.eurogamer.net/xbox-studios-restructure',
    source_domain: 'eurogamer.net',
    summary:
      'The platform holder reshuffles leadership across first-party teams following strong Game Pass growth.',
    category: 'Industry',
    hours: 22,
    views: 64_300,
    likes: 1_990,
    comments: 1_360,
    bookmarks: 880,
    reposts: 540,
    delta: -4,
  },
  {
    title: 'Age of Empires IV crowns its first million-dollar world champion',
    url: 'https://dotesports.com/age-of-empires-iv-worlds',
    source_domain: 'dotesports.com',
    summary:
      'The RTS scene reaches a new milestone as the grand final draws a record online crowd.',
    category: 'Esports',
    hours: 26,
    views: 28_900,
    likes: 1_540,
    comments: 320,
    bookmarks: 560,
    reposts: 200,
    delta: 1,
  },
];

// Rotating analysis angles so each seeded story reads differently while the
// app is on mock data. Real, per-story analysis comes from Claude (the analyze
// cron) once Supabase is populated.
const ANGLES: Array<{ tag: string; title: string; body: (c: string) => string }> = [
  {
    tag: 'WHY IT MATTERS',
    title: 'A shift in momentum',
    body: (c) =>
      `This lands at a moment when the ${c} audience is hungry for the next big thing. Early signals point to strong reception across communities.`,
  },
  {
    tag: 'WHAT TO WATCH',
    title: 'The competitive response',
    body: (c) =>
      `Rivals in the ${c} space rarely sit still. Expect counter-announcements and pricing moves within weeks as everyone recalibrates.`,
  },
  {
    tag: 'THE BIG PICTURE',
    title: 'Platform stakes',
    body: () =>
      `Storefronts and console holders have skin in this game. How exclusivity and availability shake out will shape who benefits most.`,
  },
  {
    tag: 'FOR PLAYERS',
    title: 'What changes for you',
    body: (c) =>
      `For day-one ${c} players the practical impact is immediate — wishlists, hardware plans and backlog priorities all shift around this.`,
  },
  {
    tag: 'BUSINESS ANGLE',
    title: 'A revenue signal',
    body: (c) =>
      `Beyond the headline, this is a read on where ${c} spending is heading. Publishers will be watching the monetization and attach-rate numbers closely.`,
  },
  {
    tag: 'COMMUNITY PULSE',
    title: 'Fan expectations',
    body: () =>
      `The fanbase set the bar a long time ago. Whether this clears it — or reignites old debates — will drive the conversation for the next news cycle.`,
  },
  {
    tag: 'TECH TAKE',
    title: 'Under the hood',
    body: (c) =>
      `The technical details matter more than the marketing here. For ${c}, the underlying performance and feature set are what will actually move the needle.`,
  },
  {
    tag: 'WHAT IT MEANS',
    title: 'Setting the agenda',
    body: (c) =>
      `This reframes expectations for the rest of the ${c} slate. Competitors now have to answer it, intentionally or not.`,
  },
];

const OVERVIEWS: Array<(s: string, c: string) => string> = [
  (s, c) => `${s} It's the kind of ${c} story that resets expectations for the months ahead.`,
  (s, c) => `${s} Coming now, it gives the ${c} scene a clear talking point and a lot to unpack.`,
  (s, c) => `${s} For the ${c} space, the timing is as notable as the news itself.`,
  (s, c) => `${s} Industry watchers read it as a signal of where ${c} is heading next.`,
  (s) => `${s} The reaction has been swift, and the implications run deeper than the headline suggests.`,
];

const SENTIMENTS: Array<{ pos: number; text: string }> = [
  { pos: 81.2, text: 'The reaction skews strongly positive, with fans celebrating openly. A vocal minority is urging caution until more is shown.' },
  { pos: 68.5, text: 'Sentiment is mostly upbeat but measured — excitement tempered by memories of past overpromises. People want to see it deliver.' },
  { pos: 54.0, text: 'The community is genuinely split. Optimists see a turning point; skeptics see hype that needs proof before they buy in.' },
  { pos: 73.9, text: 'Broadly positive, with enthusiasm concentrated among the core audience. Casual players are more wait-and-see.' },
  { pos: 47.3, text: 'A divisive one — frustration is running high in places, though plenty are defending the move. Expect the debate to continue.' },
];

function aiFields(
  seed: Seed,
  i: number,
): Pick<Story, 'ai_overview' | 'ai_analysis' | 'ai_sentiment'> {
  // Every seeded story carries analysis so the demo shows the full story UI.
  const a = ANGLES[i % ANGLES.length];
  const b = ANGLES[(i + 3) % ANGLES.length];
  const sentiment = SENTIMENTS[i % SENTIMENTS.length];

  return {
    ai_overview: OVERVIEWS[i % OVERVIEWS.length](seed.summary, seed.category),
    ai_analysis: [
      { tag: a.tag, title: a.title, body: a.body(seed.category) },
      { tag: b.tag, title: b.title, body: b.body(seed.category) },
    ],
    ai_sentiment: {
      pos: sentiment.pos,
      neg: Math.round((100 - sentiment.pos) * 10) / 10,
      text: sentiment.text,
    },
  };
}

import { computeScore } from '@/lib/ranking';

export const MOCK_STORIES: Story[] = SEEDS.map((seed, i) => {
  const base = {
    view_count: seed.views,
    like_count: seed.likes,
    comment_count: seed.comments,
    bookmark_count: seed.bookmarks,
    repost_count: seed.reposts,
    published_at: ago(seed.hours),
  };
  const story: Story = {
    id: `mock-${String(i + 1).padStart(2, '0')}`,
    cluster_id: `cluster-${String(i + 1).padStart(2, '0')}`,
    title: seed.title,
    url: seed.url,
    source_domain: seed.source_domain,
    summary: seed.summary,
    image_url: img(`spawn-${i + 1}`),
    category: seed.category,
    published_at: base.published_at,
    view_count: base.view_count,
    like_count: base.like_count,
    comment_count: base.comment_count,
    bookmark_count: base.bookmark_count,
    repost_count: base.repost_count,
    score: computeScore(base),
    rank_today: null,
    rank_delta: seed.delta,
    badges: seed.badges ?? [],
    is_trending: Boolean(seed.trending),
    discussion_url: 'https://www.reddit.com/r/Games/',
    discussion_source: 'reddit',
    ...aiFields(seed, i),
  };
  return story;
})
  // Rank by score and assign rank_today so the numbered feed is consistent.
  .sort((a, b) => b.score - a.score)
  .map((story, i) => ({ ...story, rank_today: i + 1 }));
