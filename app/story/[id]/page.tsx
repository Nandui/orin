import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowBigUp, ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import { getClusterStories, getStoryById } from '@/lib/stories';
import { incrementView } from '@/lib/redis';
import { formatCount, timeAgo } from '@/lib/utils';
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

export default async function StoryDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const story = await getStoryById(id);
  if (!story) notFound();

  // Hot-count the view (best-effort; no-op without Redis).
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

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <CategoryPill category={story.category} />
          <span className="font-medium text-neutral-400">
            {story.source_domain}
          </span>
          <span aria-hidden>·</span>
          <span>{timeAgo(story.published_at)} ago</span>
          {story.rank_today ? (
            <span className="ml-auto rounded-md bg-neutral-800 px-2 py-0.5 font-semibold text-neutral-300">
              #{story.rank_today} today
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
          {story.title}
        </h1>

        {story.image_url ? (
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.image_url}
              alt=""
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
          <span className="flex items-center gap-1.5 font-semibold text-orange-400">
            <ArrowBigUp className="h-5 w-5" />
            {formatCount(story.like_count)} upvotes
          </span>
          {story.discussion_url ? (
            <a
              href={story.discussion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold text-neutral-200">
                {formatCount(story.comment_count)}
              </span>
              comments
              <span className="text-xs text-neutral-600">on Reddit</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span className="font-semibold text-neutral-200">
                {formatCount(story.comment_count)}
              </span>
              comments
            </span>
          )}
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm font-semibold text-white hover:border-neutral-500"
          >
            <ExternalLink className="h-4 w-4" />
            Read source
          </a>
        </div>
      </header>

      {/* AI overview */}
      {story.ai_overview ? (
        <section className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
            Overview
          </h2>
          <p className="text-[15px] leading-relaxed text-neutral-200">
            {story.ai_overview}
          </p>
        </section>
      ) : story.summary ? (
        <p className="text-[15px] leading-relaxed text-neutral-300">
          {story.summary}
        </p>
      ) : null}

      {story.ai_analysis?.length ? (
        <AnalysisCards cards={story.ai_analysis} />
      ) : null}

      {story.ai_sentiment ? <SentimentBar sentiment={story.ai_sentiment} /> : null}

      {/* Cluster: other outlets covering this */}
      {cluster.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
            Also covering this
          </h2>
          <ul className="flex flex-col gap-2">
            {cluster.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/story/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800/80 bg-neutral-900/40 px-3 py-2 hover:border-neutral-700"
                >
                  <span className="line-clamp-1 text-sm font-medium text-neutral-200">
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

      {/* Discussion — engagement lives on the original thread, Digg-style */}
      <section id="comments" className="scroll-mt-20">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
          Discussion
        </h2>
        {story.discussion_url ? (
          <a
            href={story.discussion_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 hover:border-neutral-700"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-neutral-200">
              <MessageSquare className="h-4 w-4 text-orange-400" />
              Join the discussion on Reddit —{' '}
              {formatCount(story.comment_count)} comments
            </span>
            <ExternalLink className="h-4 w-4 text-neutral-500" />
          </a>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 p-6 text-center text-sm text-neutral-500">
            No discussion thread found for this story yet.
          </div>
        )}
      </section>
    </div>
  );
}
