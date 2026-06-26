import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Avatar } from '@base-ui-components/react/avatar';
import { getClusterStories, getStoryById } from '@/lib/stories';
import { incrementView } from '@/lib/redis';
import { categoryColor, timeAgo } from '@/lib/utils';
import { AnalysisCards } from '@/components/story/AnalysisCards';
import { SentimentBar } from '@/components/story/SentimentBar';
import { SpawnDeeper } from '@/components/story/SpawnDeeper';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await getStoryById(id);
  if (!story) return { title: 'Story not found — SPAWN' };
  return {
    title: `${story.title} — SPAWN`,
    description: story.ai_overview ?? story.summary ?? undefined,
  };
}

export default async function StoryDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const story = await getStoryById(id);
  if (!story) notFound();

  void incrementView(id);
  const cluster = await getClusterStories(story.cluster_id, story.id);
  const favicon = `https://www.google.com/s2/favicons?domain=${story.source_domain}&sz=64`;

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[640px] border-x border-[var(--line)]">
        <div className="sticky top-14 z-20 flex items-center gap-4 border-b border-[var(--line)] bg-black/80 px-4 py-3 backdrop-blur lg:top-0">
          <Link
            href="/"
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-200 transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-extrabold text-white">Story</h1>
        </div>

        <article className="flex flex-col gap-4 px-4 py-4">
          <header className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar.Root className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#16181c] ring-1 ring-white/10">
                <Avatar.Image
                  src={favicon}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
                <Avatar.Fallback className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-300">
                  {story.source_domain.slice(0, 1).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {story.source_domain}
                </p>
                <p className="muted flex items-center gap-1.5 text-[13px]">
                  <span
                    className="font-bold uppercase tracking-wide"
                    style={{ color: categoryColor(story.category) }}
                  >
                    {story.category}
                  </span>
                  · {timeAgo(story.published_at)} ago
                  {story.rank_today ? (
                    <span className="text-[var(--accent)]">
                      · #{story.rank_today} trending
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold leading-tight text-white">
              {story.title}
            </h2>

            {story.image_url ? (
              <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.image_url}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>
            ) : null}

            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
            >
              <ExternalLink className="h-4 w-4" />
              Read full story at {story.source_domain}
            </a>
          </header>

          {story.ai_overview ? (
            <section className="rounded-2xl bg-[#16181c] p-4 ring-1 ring-white/5">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--accent)]">
                Overview
              </h3>
              <p className="text-base leading-relaxed text-neutral-200">
                {story.ai_overview}
              </p>
            </section>
          ) : story.summary ? (
            <p className="text-base leading-relaxed text-neutral-300">
              {story.summary}
            </p>
          ) : null}

          {story.ai_analysis?.length ? (
            <AnalysisCards cards={story.ai_analysis} />
          ) : null}

          {story.ai_sentiment ? (
            <SentimentBar sentiment={story.ai_sentiment} />
          ) : null}

          {cluster.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--accent)]">
                Also covering this
              </h3>
              <ul className="flex flex-col gap-2">
                {cluster.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/story/${s.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#16181c] px-3 py-2 ring-1 ring-white/5 hover:ring-white/15"
                    >
                      <span className="line-clamp-1 text-sm font-medium text-neutral-200">
                        {s.title}
                      </span>
                      <span className="muted shrink-0 text-xs">
                        {s.source_domain}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <SpawnDeeper storyId={story.id} />
        </article>
      </main>
    </div>
  );
}
