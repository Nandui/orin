import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Story } from '@/types';
import { cn, timeAgo } from '@/lib/utils';

// GameVerse-style hero: full-bleed featured art with a glassy text panel bottom
// -left, plus a floating "latest" list overlaid on the right (stacked below on
// mobile).
export function Hero({
  featured,
  side,
}: {
  featured: Story;
  side: Story[];
}) {
  return (
    <div className="relative mb-6">
      <section className="relative h-[440px] overflow-hidden rounded-3xl ring-1 ring-white/5 sm:h-[480px]">
        {featured.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featured.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c]/70 to-transparent" />

        {/* Text panel */}
        <div className="absolute bottom-5 left-5 right-5 max-w-md rounded-2xl bg-black/40 p-5 backdrop-blur-md sm:bottom-6 sm:left-6 lg:right-auto">
          <h1 className="mb-2 line-clamp-2 text-xl font-semibold leading-snug text-white sm:text-2xl">
            <Link href={`/story/${featured.id}`}>{featured.title}</Link>
          </h1>
          {featured.summary ? (
            <p className="mb-4 line-clamp-2 text-sm text-neutral-300">
              {featured.summary}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-400">
              {featured.source_domain} · {timeAgo(featured.published_at)} ago
            </span>
            <Link
              href={`/story/${featured.id}`}
              aria-label="Read featured story"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f6bff] text-white transition hover:brightness-110"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest list — overlaid on desktop, stacked on mobile */}
      {side.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2 lg:absolute lg:right-5 lg:top-5 lg:mt-0 lg:w-[330px]">
          {side.map((s, i) => (
            <Link
              key={s.id}
              href={`/story/${s.id}`}
              className={cn(
                'flex gap-3 rounded-2xl p-2.5 ring-1 ring-white/5 backdrop-blur-md transition hover:ring-white/15',
                i === 0
                  ? 'border-l-2 border-[#2f6bff] bg-black/55'
                  : 'bg-black/40 lg:bg-black/35',
              )}
            >
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-sm font-semibold text-white">
                  {s.title}
                </h3>
                {s.summary ? (
                  <p className="line-clamp-1 text-xs text-neutral-400">
                    {s.summary}
                  </p>
                ) : null}
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {s.source_domain} · {timeAgo(s.published_at)} ago
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
