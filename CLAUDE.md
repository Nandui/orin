# SPAWN — architecture map for Claude Code

Gaming news aggregator. Next.js 15 App Router + TypeScript + Tailwind v4 +
Base UI + Supabase + Upstash Redis + DeepSeek (Claude fallback). The UI is an
X/Reddit-style social news feed (dark, Inter, `--accent` #1d9bf0). See
`SPAWN_PRODUCT_SPEC.md` for the full product spec and `README.md` for setup.

## Conventions

- **Server components fetch data; client components are only for interactivity.**
  Data access lives in `lib/stories.ts`; pages call it directly (RSC), and the
  API routes call the same functions. Base UI primitives (Tabs, Avatar, Menu)
  power the interactive feed bits.
- **All DB access uses the Supabase _service role_ client** (`lib/supabase/server.ts`).
  Never import it into a client component, and never expose
  `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- **Graceful degradation:** every external service (Supabase, Redis, DeepSeek)
  is optional. Helpers return `null`/no-op when unconfigured, and the data layer
  falls back to seeded mock data (`lib/mock.ts`) so the app always renders.
- **Relative time is computed server-side** and passed to client cards as a
  string prop to avoid hydration drift.
- **Freshness over engagement.** Reddit's self-serve API was closed (Responsible
  Builder Policy) and X requires paid access, so SPAWN does not source external
  upvotes/comments. Stories lead with recency/source; ranking is the decay score.
  Feed actions are real only (open, share, source); no fake vote buttons.
- **Only SPAWN's own ads.** `lib/rss.ts isAdContent()` filters sponsored/deal
  posts at ingest; `AdSlot` is the sole ad surface.

## Layout

```
app/
  layout.tsx            app shell: <SideNav> + content area
  page.tsx              home feed (sort/category/search via query params) + RightRail
  story/[id]/page.tsx   story detail (+ AI overview/analysis/sentiment when present)
  rankings|releases|esports/page.tsx
  admin/page.tsx        in-app "Refresh feed" button (runs the pipeline)
  api/
    stories/route.ts            GET list
    stories/[id]/route.ts       GET one + view increment
    highlights|rising|search/route.ts
    votes|comments|questions/route.ts   auth-gated (Phase 2)
    comments/[storyId]/route.ts GET
    cron/ingest|cluster|engagement|analyze|rank/route.ts  (+ run-all)
    webhooks/stripe/route.ts
components/
  layout/    SideNav (left rail + mobile bars), AdSlot
  feed/      PostCard, PostActions, FeedTabs, FeedControls, StoryList, RightRail
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

`lib/pipeline.ts` stages, run in-process by `api/cron/run-all`:
`cleanupAds` (purge stored ad rows) → `ingest` (29 feeds, concurrent fetch +
batched/deduped upsert) → `cluster` (keyword grouping) → `analyze` (DeepSeek →
ai_* fields) → `rank` (score/rank/delta + flush Redis views). Redis queues are
optional (DB-query fallbacks). `runEngagement` (Reddit) is retired/unused.

Freshness: Hobby crons are capped at once/day, so `.github/workflows/ingest.yml`
pings `run-all` every ~10 min (needs `SPAWN_URL` + `CRON_SECRET` repo secrets and
the deployment to be public or a Vercel protection-bypass).
