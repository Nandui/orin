// Content-shaped loading placeholder that mirrors PostCard's silhouette, so
// there's no layout shift when the real feed arrives.
export function FeedSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 border-b border-[var(--line)] px-4 py-3"
        >
          <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5" />
          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-40 rounded bg-white/5" />
            <div className="mt-2.5 h-4 w-[85%] rounded bg-white/5" />
            <div className="mt-2 h-4 w-[60%] rounded bg-white/5" />
            <div className="mt-3 flex gap-6">
              <div className="h-4 w-8 rounded bg-white/5" />
              <div className="h-4 w-8 rounded bg-white/5" />
              <div className="h-4 w-8 rounded bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Full feed-column skeleton with a header bar, used by route-level loading.tsx.
export function FeedColumnSkeleton() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[640px] border-x border-[var(--line)]">
        <div className="border-b border-[var(--line)] px-4 py-4">
          <div className="h-5 w-24 animate-pulse rounded bg-white/5" />
        </div>
        <FeedSkeleton />
      </div>
    </div>
  );
}
