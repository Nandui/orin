# SPAWN — Gaming news, ranked by the community

A gaming-specific news aggregator (Digg/Techmeme style). Crawls RSS/API
sources, clusters stories covering the same topic, generates AI overviews and
sentiment, and ranks everything by a decay-weighted engagement score.

This repo is the **Phase 1 foundation**: project scaffold, full database schema,
the data layer, RSS ingestion + ranking crons, and the feed/story UI wired to
real data. It runs and deploys with **zero environment variables** — when
Supabase isn't configured it serves seeded demo stories so the UI renders.

## Stack

| Layer        | Choice                                            |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 15 (App Router, TypeScript)               |
| Styling      | Tailwind CSS v4                                    |
| Icons        | Lucide React                                       |
| Database     | Supabase (Postgres + Auth + Realtime)             |
| Cache/counts | Upstash Redis                                      |
| AI           | Anthropic Claude API (`claude-sonnet-4-6`)         |
| Ingestion    | Vercel Cron Jobs                                   |
| Hosting      | Vercel                                             |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # optional — all values default to mock mode
npm run dev                        # http://localhost:3000
```

Everything in `.env.local` is optional for local dev. Fill in Supabase to use a
real database, Upstash for view counting, and Anthropic for AI analysis.

## Database

Apply the schema in `supabase/migrations/001_initial.sql` via the Supabase SQL
editor or `supabase db push`. It creates all tables, seeds the 10 RSS sources,
adds indexes, the signup trigger, and Row-Level Security policies.

## Cron jobs

Configured in `vercel.json`:

| Path                 | Schedule    | What it does                              |
| -------------------- | ----------- | ----------------------------------------- |
| `/api/cron/ingest`   | every 5 min | Crawl RSS sources, insert new stories     |
| `/api/cron/cluster`  | every 10 min| Keyword-cluster the pending queue (v1)    |
| `/api/cron/analyze`  | every 10 min| Generate AI overview/analysis/sentiment   |
| `/api/cron/rank`     | every 5 min | Recompute scores, flush Redis view counts |

Each route checks `Authorization: Bearer ${CRON_SECRET}` (skipped when
`CRON_SECRET` is unset, for local dev).

## API

- `GET /api/stories` — paginated list (`sort`, `category`, `period`, `page`, `limit`)
- `GET /api/stories/:id` — story + cluster siblings (bumps view counter)
- `GET /api/highlights` — the 4 highlight cards
- `GET /api/rising` — trending stories
- `GET /api/search?q=` — title search
- `GET /api/comments/:storyId` — comments for a story
- `POST /api/votes`, `/api/comments`, `/api/questions` — validated, auth-gated (Phase 2)
- `POST /api/webhooks/stripe` — subscription events (Phase 2)

## What's next (per the product spec)

- **Phase 2** — Supabase Auth, votes/comments with optimistic UI, AdSense,
  Stripe Pro subscription, AI analysis at scale.
- **Phase 3** — Redis view counting at scale, embedding clustering v2, Realtime
  live feed, X/Twitter integration, Playwire/Venatus ads.

See `CLAUDE.md` for the architecture map and `SPAWN_PRODUCT_SPEC.md` for the
full spec.
