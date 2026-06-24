# SPAWN — architecture map for Claude Code

Gaming news aggregator. Next.js 15 App Router + TypeScript + Tailwind v4 +
Supabase + Upstash Redis + Anthropic. See `SPAWN_PRODUCT_SPEC.md` for the full
product spec and `README.md` for setup.

## Conventions

- **Server components fetch data; client components are only for interactivity.**
  Data access lives in `lib/stories.ts`; pages call it directly (RSC), and the
  API routes call the same functions.
- **All DB access uses the Supabase _service role_ client** (`lib/supabase/server.ts`).
  Never import it into a client component, and never expose
  `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- **Graceful degradation:** every external service (Supabase, Redis, Anthropic)
  is optional. Helpers return `null`/no-op when unconfigured, and the data layer
  falls back to seeded mock data (`lib/mock.ts`) so the app always renders.
- **Relative time is computed server-side** and passed to client cards as a
  string prop to avoid hydration drift.

## Layout

```
app/
  layout.tsx            root layout + <Header>
  page.tsx              feed (sort/category/search via query params)
  story/[id]/page.tsx   story detail (+ AI overview/analysis/sentiment when present)
  rankings|releases|esports/page.tsx
  api/
    stories/route.ts            GET list
    stories/[id]/route.ts       GET one + view increment
    highlights|rising|search/route.ts
    votes|comments|questions/route.ts   auth-gated (Phase 2)
    comments/[storyId]/route.ts GET
    cron/ingest|cluster|analyze|rank/route.ts
    webhooks/stripe/route.ts
components/
  layout/    TopNav, AdSlot   (GameVerse-style full-bleed dark, top nav)
  feed/      Hero, StoryTile, StoryCard, StoryList, Panel, FeedControls
  story/     AnalysisCards, SentimentBar, SpawnDeeper
  ui/        CategoryPill, RankDelta
lib/
  supabase/  server.ts (service role), client.ts (browser)
  stories.ts data access (DB or mock)
  mock.ts    seeded demo stories
  rss.ts     feed parsing + category detection + seed sources
  ranking.ts decay-weighted score + rank assignment
  redis.ts   view counters + ingestion queues
  analysis.ts   story analysis (DeepSeek deepseek-chat, or Claude fallback)
  api.ts     json() + requireCron()
  utils.ts   cn, timeAgo, formatCount, category colours
types/index.ts   shared domain types
supabase/migrations/001_initial.sql
```

## Pipeline

`ingest` (RSS → stories, enqueue) → `cluster` (keyword grouping) →
`analyze` (Claude → ai_* fields) → `rank` (score/rank/delta + flush Redis views).
Queues live in Redis (`stories:pending_cluster`, `stories:pending_analysis`).
