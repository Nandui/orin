-- SPAWN — initial schema (product spec §3).
-- Run in the Supabase SQL editor or via `supabase db push`.

-- ---------------------------------------------------------------------------
-- 3.1 rss_sources
-- ---------------------------------------------------------------------------
create table if not exists rss_sources (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  url             text not null unique,
  category        text not null, -- RPG | FPS | Strategy | Action | Indie | Industry | Hardware | Esports
  homepage        text,
  is_active       boolean default true,
  last_crawled_at timestamptz,
  created_at      timestamptz default now()
);

insert into rss_sources (name, url, category, homepage) values
  ('IGN',                'https://feeds.feedburner.com/ign/all',     'Industry',  'ign.com'),
  ('Eurogamer',          'https://www.eurogamer.net/feed',           'Industry',  'eurogamer.net'),
  ('PC Gamer',           'https://www.pcgamer.com/rss/',             'Industry',  'pcgamer.com'),
  ('Rock Paper Shotgun', 'https://www.rockpapershotgun.com/feed',    'Indie',     'rockpapershotgun.com'),
  ('Kotaku',             'https://kotaku.com/rss',                   'Industry',  'kotaku.com'),
  ('Polygon',            'https://www.polygon.com/rss/index.xml',    'Industry',  'polygon.com'),
  ('Gamespot',           'https://www.gamespot.com/feeds/news/',     'Industry',  'gamespot.com'),
  ('HLTV',               'https://www.hltv.org/rss/news',            'Esports',   'hltv.org'),
  ('Dot Esports',        'https://dotesports.com/feed',              'Esports',   'dotesports.com'),
  ('Tom''s Hardware',    'https://www.tomshardware.com/feeds/all',   'Hardware',  'tomshardware.com')
on conflict (url) do nothing;

-- ---------------------------------------------------------------------------
-- 3.2 clusters
-- ---------------------------------------------------------------------------
create table if not exists clusters (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,        -- auto-generated from most-viewed story title
  category    text not null,
  story_count int default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 3.3 stories
-- ---------------------------------------------------------------------------
create table if not exists stories (
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
create index if not exists stories_score_idx on stories(score desc);
create index if not exists stories_published_idx on stories(published_at desc);
create index if not exists stories_cluster_idx on stories(cluster_id);

-- ---------------------------------------------------------------------------
-- 3.4 profiles
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  username               text unique,
  avatar_url             text,
  is_pro                 boolean default false,
  stripe_customer_id     text,
  stripe_subscription_id text,
  pro_expires_at         timestamptz,
  preferences            jsonb default '{}',
  created_at             timestamptz default now()
);

-- Auto-create a profile on signup.
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- 3.5 votes
-- ---------------------------------------------------------------------------
create table if not exists votes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  story_id   uuid references stories(id) on delete cascade,
  type       text not null check (type in ('like', 'bookmark')),
  created_at timestamptz default now(),
  unique(user_id, story_id, type)
);

-- ---------------------------------------------------------------------------
-- 3.6 comments
-- ---------------------------------------------------------------------------
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  story_id   uuid references stories(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  parent_id  uuid references comments(id) on delete cascade,
  content    text not null,
  sentiment  text check (sentiment in ('positive', 'negative', 'neutral')),
  like_count int default 0,
  created_at timestamptz default now()
);
create index if not exists comments_story_idx on comments(story_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3.7 x_posts
-- ---------------------------------------------------------------------------
create table if not exists x_posts (
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

-- ---------------------------------------------------------------------------
-- 3.8 related_links
-- ---------------------------------------------------------------------------
create table if not exists related_links (
  id         uuid primary key default gen_random_uuid(),
  story_id   uuid references stories(id) on delete cascade,
  cluster_id uuid references clusters(id),
  title      text not null,
  url        text not null,
  source     text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 3.9 deep_questions
-- ---------------------------------------------------------------------------
create table if not exists deep_questions (
  id         uuid primary key default gen_random_uuid(),
  story_id   uuid references stories(id) on delete cascade,
  user_id    uuid references profiles(id),
  question   text not null,
  answer     text,                      -- AI-generated answer (optional, Pro feature)
  upvotes    int default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 3.10 Row-Level Security
-- ---------------------------------------------------------------------------
alter table stories enable row level security;
drop policy if exists "stories_public_read" on stories;
create policy "stories_public_read" on stories for select using (true);

alter table votes enable row level security;
drop policy if exists "votes_read" on votes;
create policy "votes_read" on votes for select using (true);
drop policy if exists "votes_insert" on votes;
create policy "votes_insert" on votes for insert with check (auth.uid() = user_id);
drop policy if exists "votes_delete" on votes;
create policy "votes_delete" on votes for delete using (auth.uid() = user_id);

alter table comments enable row level security;
drop policy if exists "comments_public_read" on comments;
create policy "comments_public_read" on comments for select using (true);
drop policy if exists "comments_insert" on comments;
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
drop policy if exists "comments_update" on comments;
create policy "comments_update" on comments for update using (auth.uid() = user_id);

-- Public read for the remaining content tables.
alter table clusters enable row level security;
drop policy if exists "clusters_public_read" on clusters;
create policy "clusters_public_read" on clusters for select using (true);

alter table related_links enable row level security;
drop policy if exists "related_links_public_read" on related_links;
create policy "related_links_public_read" on related_links for select using (true);

alter table x_posts enable row level security;
drop policy if exists "x_posts_public_read" on x_posts;
create policy "x_posts_public_read" on x_posts for select using (true);

alter table deep_questions enable row level security;
drop policy if exists "deep_questions_public_read" on deep_questions;
create policy "deep_questions_public_read" on deep_questions for select using (true);

alter table profiles enable row level security;
drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read" on profiles for select using (auth.uid() = id);
drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles for update using (auth.uid() = id);
