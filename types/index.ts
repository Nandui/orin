// Shared domain types for SPAWN. These mirror the Postgres schema in
// supabase/migrations/001_initial.sql but are shaped for direct UI use.

export type Category =
  | 'RPG'
  | 'FPS'
  | 'Strategy'
  | 'Action'
  | 'Indie'
  | 'Industry'
  | 'Hardware'
  | 'Esports';

export const CATEGORIES: Category[] = [
  'RPG',
  'FPS',
  'Strategy',
  'Action',
  'Indie',
  'Industry',
  'Hardware',
  'Esports',
];

/** A small coloured pill rendered on a story card (e.g. "BREAKING"). */
export interface Badge {
  label: string;
  bg: string;
  color: string;
}

/** One AI "analysis angle" card on the story detail page. */
export interface AnalysisCard {
  tag: string;
  title: string;
  body: string;
}

/** AI community-sentiment summary. `pos` + `neg` sum to ~100. */
export interface Sentiment {
  pos: number;
  neg: number;
  text: string;
}

export interface Story {
  id: string;
  cluster_id: string | null;
  title: string;
  url: string;
  source_domain: string;
  summary: string | null;
  image_url: string | null;
  category: Category;
  published_at: string;

  // AI-generated, populated async after ingestion (may be null).
  ai_overview: string | null;
  ai_analysis: AnalysisCard[] | null;
  ai_sentiment: Sentiment | null;

  // Engagement.
  view_count: number;
  like_count: number;
  bookmark_count: number;
  comment_count: number;
  repost_count: number;

  // Ranking.
  score: number;
  rank_today: number | null;
  rank_delta: number;

  // Presentation.
  badges: Badge[];
  is_trending: boolean;
}

export interface Cluster {
  id: string;
  title: string;
  category: Category;
  story_count: number;
}

export interface RelatedLink {
  id: string;
  title: string;
  url: string;
  source: string;
}

export interface Comment {
  id: string;
  story_id: string;
  parent_id: string | null;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  like_count: number;
  created_at: string;
  author?: string;
}

export type HighlightKind =
  | 'icymi'
  | 'most_viewed'
  | 'most_debated'
  | 'fastest_climbing';

export interface Highlight {
  kind: HighlightKind;
  label: string;
  story: Story;
}

export type StorySort = 'trending' | 'new' | 'top';
export type StoryPeriod = 'today' | '7days';

export interface StoryQuery {
  sort?: StorySort;
  category?: Category | null;
  period?: StoryPeriod;
  page?: number;
  limit?: number;
}
