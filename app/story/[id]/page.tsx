import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getClusterStories, getStoryById } from '@/lib/stories';
import { incrementView } from '@/lib/redis';
import { timeAgo } from '@/lib/utils';
import { CategoryPill } from '@/components/ui/CategoryPill';
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <CategoryPill category={story.category} />
          <span className="font-medium text-neutral-400">
            {story.source_domain}
          </span>
          <span aria-hidden>·</span>
          <span>{timeAgo(story.published_at)} ago</span>
          {story.rank_today ? (
            <span className="kicker ml-auto rounded-full bg-[#f0c24c]/15 px-2.5 py-0.5 text-[10px] font-bold text-[var(--gold)]">
              #{story.rank_today} trending
            </span>
          ) : null}
        </div>

        <h1 className="font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl">
          {story.title}
        </h1>

        {story.image_url ? (
          <div className="overflow-hidden rounded-2xl bg-neutral-800 ring-1 ring-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.image_url}
              alt=""
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-black hover:brightness-105"
          >
            <ExternalLink className="h-4 w-4" />
            Read full story at {story.source_domain}
          </a>
        </div>
      </header>

      {story.ai_overview ? (
        <section className="rounded-2xl bg-[#141414] p-4 ring-1 ring-white/5">
          <h2 className="kicker mb-2 text-xs font-bold text-[var(--gold)]">
            Overview
          </h2>
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

      {story.ai_sentiment ? <SentimentBar sentiment={story.ai_sentiment} /> : null}

      {cluster.length > 0 ? (
        <section>
          <h2 className="kicker mb-3 border-b border-[#f0c24c]/40 pb-2 text-xs font-bold text-[var(--gold)]">
            Also covering this
          </h2>
          <ul className="flex flex-col gap-2">
            {cluster.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/story/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#141414] px-3 py-2 ring-1 ring-white/5 hover:ring-white/15"
                >
                  <span className="line-clamp-1 font-display text-sm font-semibold text-neutral-200">
                    {s.title}
                  </span>
                  <span className="shrink-0 text-xs text-neutral-500">
                    {s.source_domain}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <SpawnDeeper />
    </div>
  );
}
