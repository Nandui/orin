import Link from 'next/link';
import type { Story } from '@/types';
import { timeAgo } from '@/lib/utils';

function readMinutes(story: Story): number {
  const words = (story.summary ?? story.title).split(/\s+/).length;
  return Math.max(2, Math.round(words / 60));
}

// Editorial lead: full-bleed art with a kicker, a large serif headline, byline,
// carousel dots, and a "NEXT" preview card — newspaper landing-page style.
export function Hero({ featured, next }: { featured: Story; next?: Story }) {
  return (
    <section className="relative h-[460px] overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-[520px]">
      {featured.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={featured.image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="max-w-xl">
          <span className="kicker text-[11px] font-bold text-[var(--gold)]">
            {featured.category}
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.04] text-[var(--gold)] sm:text-5xl lg:text-6xl">
            <Link href={`/story/${featured.id}`} className="hover:underline">
              {featured.title}
            </Link>
          </h1>

          <p className="kicker mt-5 text-[11px] text-neutral-300">
            {readMinutes(featured)} min read
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[11px] font-bold text-white ring-1 ring-white/15">
              {featured.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                featured.source_domain.slice(0, 1).toUpperCase()
              )}
            </span>
            <span className="kicker text-[11px] text-neutral-300">
              via {featured.source_domain} · {timeAgo(featured.published_at)} ago
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={
                  n === 1
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white ring-1 ring-white/20'
                    : 'text-[11px] font-medium text-neutral-500'
                }
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {next ? (
          <div>
            <span className="kicker text-[11px] font-bold text-neutral-400">
              Next
            </span>
            <Link
              href={`/story/${next.id}`}
              className="mt-2 flex max-w-md items-center gap-3 rounded-2xl bg-black/45 p-2.5 ring-1 ring-white/10 backdrop-blur-md transition hover:ring-white/25"
            >
              <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                {next.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={next.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-display text-sm font-semibold text-white">
                  {next.title}
                </span>
                <span className="kicker mt-1 block text-[10px] text-neutral-400">
                  {readMinutes(next)} min read
                </span>
              </span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
