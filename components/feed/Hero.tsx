import Link from 'next/link';
import { ArrowBigUp, ArrowUpRight, MessageSquare } from 'lucide-react';
import type { Story } from '@/types';
import { formatCount, timeAgo } from '@/lib/utils';

// Featured story, RIM-hero style: big condensed title, game art bleeding in from
// the right, a round CTA, and the original-thread engagement.
export function Hero({ story }: { story: Story }) {
  return (
    <section className="notch-br relative mb-5 min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a3a3e] via-[#262629] to-[#161618] sm:min-h-[380px]">
      {story.image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#161618] via-[#161618]/85 to-transparent sm:via-[#161618]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161618]/70 to-transparent" />
        </>
      ) : null}

      <div className="relative flex h-full max-w-2xl flex-col p-6 sm:p-9">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            <span className="mr-2 text-[#ff2d4d]">●</span>
            {story.category} · {timeAgo(story.published_at)} ago
          </span>
          {story.rank_today ? (
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              #{story.rank_today} Trending
            </span>
          ) : null}
        </div>

        <h1 className="font-display mb-3 text-3xl font-bold uppercase leading-[0.95] text-white sm:text-5xl">
          <Link href={`/story/${story.id}`} className="line-clamp-3 hover:text-neutral-200">
            {story.title}
          </Link>
        </h1>

        {story.summary ? (
          <p className="mb-auto max-w-md text-sm leading-relaxed text-neutral-300 line-clamp-3">
            {story.summary}
          </p>
        ) : (
          <div className="mb-auto" />
        )}

        <div className="mt-6 flex items-center gap-5">
          <Link
            href={`/story/${story.id}`}
            className="font-display flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-[#ff2d4d] text-center text-sm font-semibold uppercase text-white shadow-[0_0_40px_-6px_rgba(255,45,77,0.8)] transition-transform hover:scale-105 sm:h-24 sm:w-24"
          >
            Read
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-2xl font-bold text-white">
              <ArrowBigUp className="h-6 w-6 text-[#ff2d4d]" />
              {formatCount(story.like_count)}
            </span>
            {story.discussion_url ? (
              <a
                href={story.discussion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <MessageSquare className="h-3.5 w-3.5" />
                {formatCount(story.comment_count)} discussing on Reddit
              </a>
            ) : (
              <span className="text-xs font-medium text-neutral-400">
                {formatCount(story.comment_count)} comments
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
