import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <span className="text-5xl font-black text-neutral-700">404</span>
      <h1 className="text-lg font-semibold text-white">Story not found</h1>
      <p className="text-sm text-neutral-400">
        This story may have dropped off the feed.
      </p>
      <Link
        href="/"
        className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-white hover:border-neutral-500"
      >
        Back to feed
      </Link>
    </div>
  );
}
