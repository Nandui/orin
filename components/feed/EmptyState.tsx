import Link from 'next/link';

// Shared, user-facing empty state — no backend/implementation details.
export function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="muted mt-1 text-sm">{message}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
