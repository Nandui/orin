# SPAWN — Product Spec & Claude Code Bootstrap
> Gaming news aggregator in the style of Digg/Tech. Built, not chosen.

---

## 1. Product Overview

**SPAWN /GAMING** is a gaming-specific news aggregator that:
- Crawls 10–15 RSS/API sources every 5 minutes
- Auto-clusters stories covering the same topic across outlets
- Generates AI overviews, analysis angles, and sentiment summaries per story
- Ranks stories by a decay-weighted engagement score
- Monetises via display ads (free tier) + Pro subscription (ad-free)

The UI reference is `spawn-full.jsx` (already designed and approved). This spec covers everything needed to ship the backend, data layer, and wire up the frontend.

---

## 2. Tech Stack

| Layer          | Choice                                              |
|---------------|-----------------------------------------------------|
| Framework      | Next.js 15 (App Router, TypeScript)                |
| Styling        | Tailwind CSS + shadcn/ui + Radix UI                |
| Animation      | Framer Motion                                       |
| Icons          | Lucide React                                        |
| Database       | Supabase (Postgres + Auth + Realtime)               |
| Cache / Counts | Upstash Redis                                       |
| AI             | Anthropic Claude API (claude-sonnet-4-6)            |
| Ingestion      | Vercel Cron Jobs (every 5 min)                      |
| Payments       | Stripe (subscriptions)                              |
| Ads Phase 1    | Google AdSense                                      |
| Ads Phase 2    | Playwire or Venatus (swap once traffic grows)       |
| Hosting        | Vercel                                              |

---

## 3. Database Schema (Supabase / Postgres)

### 3.1 `rss_sources`
```sql
create table rss_sources (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  url         text not null unique,
  category    text not null, -- RPG | FPS | Strategy | Action | Indie | Industry | Hardware | Esports
  homepage    text,
  is_active   boolean default true,
  last_crawled_at timestamptz,
  created_at  timestamptz default now()
);
```

Seed values:
```sql
insert into rss_sources (name, url, category, homepage) values
  ('IGN',            'https://feeds.feedburner.com/ign/all',          'Industry',  'ign.com'),
  ('Eurogamer',      'https://www.eurogamer.net/feed',                 'Industry',  'eurogamer.net'),
  ('PC Gamer',       'https://www.pcgamer.com/rss/',                   'Industry',  'pcgamer.com'),
  ('Rock Paper Shotgun','https://www.rockpapershotgun.com/feed',       'Indie',     'rockpapershotgun.com'),
  ('Kotaku',         'https://kotaku.com/rss',                         'Industry',  'kotaku.com'),
  ('Polygon',        'https://www.polygon.com/rss/index.xml',          'Industry',  'polygon.com'),
  ('Gamespot',       'https://www.gamespot.com/feeds/news/',           'Industry',  'gamespot.com'),
  ('HLTV',           'https://www.hltv.org/rss/news',                  'Esports',   'hltv.org'),
  ('Dot Esports',    'https://dotesports.com/feed',                    'Esports',   'dotesports.com'),
  ('Tom''s Hardware','https://www.tomshardware.com/feeds/all',         'Hardware',  'tomshardware.com');
```

### 3.2 `clusters`
```sql
create table clusters (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,           -- auto-generated from most-viewed story title
  category    text not null,
  story_count int default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

### 3.3 `stories`
```sql
create table stories (
  id              uuid primary key default gen_random_uuid(),
  cluster_id      uuid references clusters(id),
  source_id       uuid references rss_sources(id),
  title           text not null,
  url             text not null unique,
  source_domain   text not null,        -- e.g. "ign.com"
  summary         text,                 -- from RSS description
  image_url       text,
  category        text not null,
  published_at    timestamptz not null,
  -- AI-generated fields (populated async after ingestion)
  ai_overview     text,
  ai_analysis     jsonb,                -- [{tag, title, body}, {tag, title, body}]
  ai_sentiment    jsonb,                -- {pos: 75.6, neg: 24.4, text: "..."}
  -- Engagement (hot counts in Redis, cold in here)
  view_count      bigint default 0,
  like_count      int default 0,
  bookmark_count  int default 0,
  comment_count   int default 0,
  repost_count    int default 0,
  -- Ranking
  score           float default 0,      -- recomputed every crawl cycle
  rank_today      int,
  rank_delta      int default 0,        -- rank change vs previous cycle
  -- Badges
  badges          jsonb default '[]',   -- [{label, bg, color}]
  is_trending     boolean default false,
  created_at      timestamptz default now()
);
create index stories_score_idx on stories(score desc);
create index stories_published_idx on stories(published_at desc);
create index stories_cluster_idx on stories(cluster_id);
```

### 3.4 `profiles`
```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  avatar_url  text,
  is_pro      boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  pro_expires_at timestamptz,
  created_at  timestamptz default now()
);
-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### 3.5 `votes`
```sql
create table votes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  story_id    uuid references stories(id) on delete cascade,
  type        text not null check (type in ('like', 'bookmark')),
  created_at  timestamptz default now(),
  unique(user_id, story_id, type)
);
```

### 3.6 `comments`
```sql
create table comments (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid references stories(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  parent_id   uuid references comments(id) on delete cascade,
  content     text not null,
  sentiment   text check (sentiment in ('positive', 'negative', 'neutral')),
  like_count  int default 0,
  created_at  timestamptz default now()
);
create index comments_story_idx on comments(story_id, created_at desc);
```

### 3.7 `x_posts`
```sql
create table x_posts (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid references stories(id) on delete cascade,
  tweet_id    text unique,
  user_handle text not null,
  user_name   text not null,
  content     text not null,
  views       bigint default 0,
  likes       int default 0,
  bookmarks   int default 0,
  reposts     int default 0,
  posted_at   timestamptz,
  fetched_at  timestamptz default now()
);
```

### 3.8 `related_links`
```sql
create table related_links (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid references stories(id) on delete cascade,
  cluster_id  uuid references clusters(id),
  title       text not null,
  url         text not null,
  source      text not null,
  created_at  timestamptz default now()
);
```

### 3.9 `deep_questions`
```sql
create table deep_questions (
  id          uuid primary key default gen_random_uuid(),
  story_id    uuid references stories(id) on delete cascade,
  user_id     uuid references profiles(id),
  question    text not null,
  answer      text,                     -- AI-generated answer (optional, Pro feature)
  upvotes     int default 0,
  created_at  timestamptz default now()
);
```

### 3.10 Row-Level Security
```sql
-- Stories: public read
alter table stories enable row level security;
create policy "stories_public_read" on stories for select using (true);

-- Votes: auth required, own rows only
alter table votes enable row level security;
create policy "votes_read" on votes for select using (true);
create policy "votes_insert" on votes for insert with check (auth.uid() = user_id);
create policy "votes_delete" on votes for delete using (auth.uid() = user_id);

-- Comments: public read, auth write
alter table comments enable row level security;
create policy "comments_public_read" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments_update" on comments for update using (auth.uid() = user_id);
```

---

## 4. Project File Structure

```
spawn/
├── CLAUDE.md                        ← this document, trimmed for Claude Code
├── .env.local
├── vercel.json
├── app/
│   ├── layout.tsx                   ← root layout, fonts, providers
│   ├── page.tsx                     ← feed page
│   ├── story/
│   │   └── [id]/
│   │       └── page.tsx             ← story detail page
│   ├── rankings/page.tsx
│   ├── releases/page.tsx
│   ├── esports/page.tsx
│   └── api/
│       ├── stories/
│       │   ├── route.ts             ← GET list (paginated, sorted)
│       │   └── [id]/
│       │       └── route.ts         ← GET single story + increment view
│       ├── highlights/route.ts      ← GET today's 4 highlight cards
│       ├── rising/route.ts          ← GET rising stories for sidebar
│       ├── votes/route.ts           ← POST/DELETE like or bookmark
│       ├── comments/
│       │   ├── route.ts             ← POST comment
│       │   └── [storyId]/route.ts   ← GET comments for story
│       ├── questions/route.ts       ← POST deep question
│       ├── search/route.ts          ← GET search results
│       ├── cron/
│       │   ├── ingest/route.ts      ← RSS crawl (Vercel Cron, every 5 min)
│       │   ├── cluster/route.ts     ← Clustering pass (every 10 min)
│       │   ├── analyze/route.ts     ← AI analysis generation (every 10 min)
│       │   └── rank/route.ts        ← Recompute scores (every 5 min)
│       └── webhooks/
│           └── stripe/route.ts      ← Stripe subscription events
├── components/
│   ├── feed/
│   │   ├── FeedPage.tsx
│   │   ├── StoryCard.tsx            ← numbered card with all meta
│   │   ├── HighlightStrip.tsx       ← 4-card highlights row
│   │   ├── RisingSidebar.tsx
│   │   ├── StarsSidebar.tsx
│   │   └── LiveFeedDrawer.tsx       ← Supabase realtime new stories
│   ├── story/
│   │   ├── StoryDetailPage.tsx
│   │   ├── StoryHeader.tsx          ← title + overview + badges + avatars
│   │   ├── OriginalPost.tsx         ← tweet/post card
│   │   ├── AnalysisCards.tsx        ← 2-col AI analysis
│   │   ├── SentimentBar.tsx
│   │   ├── ClusterEngagement.tsx    ← sparkline grid
│   │   ├── PostsFromX.tsx           ← aggregate stats + tweet cards
│   │   ├── RelatedLinks.tsx
│   │   └── SpawnDeeper.tsx          ← Q&A widget
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── AdSlot.tsx               ← renders ad or null if Pro
│   │   └── ProModal.tsx             ← Stripe checkout trigger
│   └── ui/                          ← shadcn generated components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                ← browser client
│   │   └── server.ts                ← server client (RSC / route handlers)
│   ├── redis.ts                     ← Upstash client + view increment helpers
│   ├── anthropic.ts                 ← Claude API helpers
│   ├── rss.ts                       ← RSS parsing + source fetching
│   ├── clustering.ts                ← embedding + cosine similarity
│   ├── ranking.ts                   ← score formula
│   ├── stripe.ts                    ← Stripe client + helpers
│   └── utils.ts                     ← fmt, timeAgo, slugify, etc.
├── hooks/
│   ├── useStories.ts
│   ├── useVote.ts
│   └── useAuth.ts
├── types/
│   └── index.ts                     ← Story, Cluster, Profile, Vote, Comment types
└── supabase/
    └── migrations/
        └── 001_initial.sql
```

---

## 5. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=

CRON_SECRET=                    # random string, sent as Bearer token by Vercel Cron
NEXT_PUBLIC_APP_URL=https://spawn.gg
```

---

## 6. Vercel Cron Config

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/ingest",  "schedule": "*/5 * * * *"  },
    { "path": "/api/cron/cluster", "schedule": "*/10 * * * *" },
    { "path": "/api/cron/analyze", "schedule": "*/10 * * * *" },
    { "path": "/api/cron/rank",    "schedule": "*/5 * * * *"  }
  ]
}
```

All cron routes must check:
```ts
if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## 7. Core Logic

### 7.1 RSS Ingestion (`/api/cron/ingest`)

```
1. SELECT all active rss_sources
2. For each source: fetch RSS feed (use rss-parser npm package)
3. For each item in feed:
   a. Check if url already exists in stories table → skip if so
   b. Detect category from source default + keyword overrides
   c. INSERT into stories (title, url, summary, source_domain, category, published_at)
   d. Push story_id to Redis queue "stories:pending_cluster"
   e. Push story_id to Redis queue "stories:pending_analysis"
4. UPDATE rss_sources.last_crawled_at = now()
```

### 7.2 Clustering (`/api/cron/cluster`)

```
1. LPOP up to 50 IDs from Redis "stories:pending_cluster"
2. For each story_id:
   a. Fetch title from DB
   b. Get embedding: call Claude API with tool to embed, OR use a simple
      TF-IDF approach first (match on game title nouns extracted from headline)
   c. Compare embedding against last 48h stories (already clustered)
   d. Cosine similarity > 0.82 → assign same cluster_id
   e. Otherwise → create new cluster, set this story as cluster root
3. UPDATE stories.cluster_id, UPDATE clusters.story_count
```

**Simple v1 clustering (ship first, improve later):**
Extract key nouns from headline using Claude:
```ts
// lib/clustering.ts
export async function extractTopics(title: string): Promise<string[]> {
  // Call Claude with a short prompt to extract game names / proper nouns
  // Return ["Elden Ring", "FromSoftware"] etc.
  // Then cluster by exact/partial match on these topics within 48h window
}
```

### 7.3 AI Analysis Generation (`/api/cron/analyze`)

```
1. LPOP up to 20 IDs from Redis "stories:pending_analysis"
2. For each story_id:
   a. Fetch title + summary + cluster stories titles from DB
   b. Call Claude API (claude-sonnet-4-6):
```

```ts
// lib/anthropic.ts
export async function generateStoryAnalysis(story: Story, clusterStories: Story[]) {
  const prompt = `
You are an editorial AI for SPAWN, a gaming news aggregator.

Story: "${story.title}"
Summary: "${story.summary}"
Other outlets covering the same story: ${clusterStories.map(s => `"${s.title}"`).join(', ')}

Return ONLY a JSON object (no markdown) with this exact shape:
{
  "overview": "2-3 sentence editorial overview of what this story means for gaming",
  "analysis": [
    { "tag": "SHORT LABEL IN CAPS", "title": "Analysis card title", "body": "2-3 sentence analysis" },
    { "tag": "SHORT LABEL IN CAPS", "title": "Second angle title",  "body": "2-3 sentence analysis" }
  ],
  "sentiment": {
    "pos": 75.6,
    "neg": 24.4,
    "text": "2 sentence summary of how the gaming community is likely reacting to this"
  }
}
  `;
  // Parse and store as ai_overview, ai_analysis, ai_sentiment on the story row
}
```

**Cost:** ~$0.003 per story at Sonnet 4.6 rates. At 100 new stories/day = ~$0.30/day = ~$9/month.

### 7.4 Ranking Algorithm (`/api/cron/rank`)

```ts
// lib/ranking.ts
export function computeScore(story: Story): number {
  const ageHours = (Date.now() - new Date(story.published_at).getTime()) / 3_600_000;
  const engagement =
    story.like_count * 3 +
    story.comment_count * 5 +
    story.bookmark_count * 2 +
    story.view_count * 0.001 +
    story.repost_count * 1.5;
  return engagement / Math.pow(ageHours + 2, 1.8);
}
```

Cron updates `stories.score`, `stories.rank_today`, and `stories.rank_delta` for all stories published in the last 7 days.

### 7.5 View Counting (Redis)

Views are hot-counted in Redis to avoid high-write DB pressure:

```ts
// lib/redis.ts
export async function incrementView(storyId: string) {
  const key = `story:views:${storyId}`;
  await redis.incr(key);
  // Flush to DB every 100 views or on cron
}
```

Flush cron: add to `/api/cron/rank` — pull all `story:views:*` keys, batch-update DB, delete keys.

---

## 8. Key API Routes

### `GET /api/stories`
Query params: `sort` (trending|new|top), `category`, `period` (today|7days), `page`, `limit`
Returns: paginated stories with user vote state (if authed)

### `GET /api/stories/[id]`
Returns: full story + cluster stories + x_posts + related_links + deep_questions
Side effect: increments Redis view counter

### `GET /api/highlights`
Returns: 4 cards — ICYMI (oldest trending), #1 Viewed, Most Debated (highest comment_count), Fastest Climbing (highest rank_delta)

### `GET /api/rising`
Returns: stories with `is_trending = true` ordered by score, last 6h window

### `POST /api/votes`
Body: `{ story_id, type: 'like' | 'bookmark' }`
Auth required. Upserts vote, increments/decrements story counter.

### `POST /api/questions`
Body: `{ story_id, question }`
Auth required. Inserts question. If user is Pro, optionally triggers AI answer.

---

## 9. Monetisation Implementation

### Ads (Free Tier)

```tsx
// components/layout/AdSlot.tsx
export function AdSlot({ slot }: { slot: 'sidebar' | 'feed-inline' }) {
  const { isPro } = useAuth();
  if (isPro) return null;
  // Phase 1: AdSense
  return <ins className="adsbygoogle" data-ad-slot="..." />;
  // Phase 2: swap for Playwire/Venatus script tags
}
```

Ad placements:
- Sidebar: 300×250 below Recent Stars
- Feed inline: between story #4 and #5 (not on story detail pages for cleaner reading)

### Pro Subscription (Stripe)

```ts
// Stripe products to create:
// - SPAWN Pro Monthly: $4.99/month
// - SPAWN Pro Yearly:  $39.00/year

// Webhook handler: /api/webhooks/stripe
// Events to handle:
//   customer.subscription.created → set profiles.is_pro = true, pro_expires_at
//   customer.subscription.deleted → set profiles.is_pro = false
//   invoice.payment_failed        → email user (use Supabase email or Resend)
```

Pro benefits to gate:
- No ads (`profiles.is_pro` check in `AdSlot`)
- Rising stories (show `is_trending` stories 1hr earlier than free tier timestamp gate)
- Custom category filter saved in `profiles.preferences` JSONB
- `Spawn Deeper` AI answer on questions

---

## 10. Frontend Wiring Notes

The approved UI is in `spawn-full.jsx`. Convert it to the Next.js component structure:

- `FeedPage.tsx` → RSC wrapper fetching initial stories, passes to client components
- `StoryCard.tsx` → client component for votes/interactions
- `StoryDetailPage.tsx` → RSC wrapper, parallel data fetch (story + x_posts + questions)
- All vote/like interactions → optimistic updates via `useOptimistic` (React 19)
- Realtime "LIVE FEED" toggle → Supabase channel subscription to `stories` table inserts

### Supabase Realtime (Live Feed)
```ts
// In LiveFeedDrawer.tsx
const channel = supabase
  .channel('new-stories')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'stories'
  }, payload => {
    addToLiveFeed(payload.new);
  })
  .subscribe();
```

---

## 11. Build Phases

### Phase 1 — Ship the Feed (Weeks 1–4)
- [ ] Next.js project init with stack
- [ ] Supabase schema + migrations
- [ ] RSS ingestion cron (10 sources)
- [ ] Ranking algorithm
- [ ] Feed UI wired to real data (FeedPage, StoryCard, Highlights, Sidebar)
- [ ] Story detail page (no AI fields yet — show what's available)
- [ ] Deploy to Vercel → **go live**

### Phase 2 — Engagement (Weeks 5–8)
- [ ] Supabase Auth (email + Google OAuth)
- [ ] Votes (likes + bookmarks) with optimistic UI
- [ ] Comments with threading
- [ ] AI analysis generation cron
- [ ] Story clustering v1 (keyword-based)
- [ ] AdSense integration
- [ ] Stripe Pro subscription + webhook

### Phase 3 — Polish (Weeks 9–12)
- [ ] Upstash Redis view counting
- [ ] Story clustering v2 (embeddings)
- [ ] Supabase Realtime live feed
- [ ] X/Twitter posts integration (X API v2 Basic tier, $100/mo)
- [ ] Mobile-responsive audit
- [ ] Switch ads to Playwire/Venatus
- [ ] Rankings page
- [ ] Releases calendar page

---

## 12. Claude Code Session Starter

Paste this at the top of your first Claude Code session:

```
We are building SPAWN — a gaming news aggregator styled after Digg/Tech.
The approved UI design is in spawn-full.jsx (reference only, do not import).
Stack: Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, Supabase, Upstash Redis, Anthropic API, Stripe.
Full spec is in SPAWN_PRODUCT_SPEC.md — read it before writing any code.
Start with Phase 1: project init, Supabase schema, RSS ingestion, and wiring the feed page to real data.
Use server components for data fetching, client components only for interactivity.
All DB access in server components and route handlers uses the Supabase service role client.
Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
```

---

## 13. Recommended npm Packages

```bash
# Core
npx create-next-app@latest spawn --typescript --tailwind --app

# Supabase
npm i @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npm i framer-motion lucide-react

# RSS
npm i rss-parser

# Redis
npm i @upstash/redis

# AI
npm i @anthropic-ai/sdk

# Stripe
npm i stripe @stripe/stripe-js

# Utilities
npm i date-fns zod
```

---

## 14. Domain & Branding

- **Name:** SPAWN
- **Domain target:** spawn.gg (or spawngaming.com as fallback)
- **Tagline:** Gaming news, ranked by the community.
- **Logo:** SPAWN + /GAMING pill (as in UI mockup)
- **Category colours:**
  - RPG `#7c3aed` · FPS `#dc2626` · Strategy `#2563eb` · Action `#ea580c`
  - Indie `#16a34a` · Industry `#6b7280` · Hardware `#0891b2` · Esports `#d97706`

---

*Spec version: 1.0 — June 2026*
