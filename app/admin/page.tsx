import { Wrench } from 'lucide-react';
import { RefreshButton } from './RefreshButton';

export const dynamic = 'force-dynamic';
// The pipeline (esp. AI analysis) can run for a while; give the action room.
export const maxDuration = 60;

export const metadata = {
  title: 'Admin — SPAWN',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-2">
        <Wrench className="h-5 w-5 text-[#2f6bff]" />
        <h1 className="text-2xl font-bold text-white">Admin</h1>
      </div>
      <p className="mb-6 text-sm text-neutral-400">
        Pull the latest news on demand. This runs the same pipeline as the daily
        job — it removes ad / sponsored posts, ingests fresh stories, pulls the
        Reddit discussion stats, and runs the AI analysis.
      </p>

      <RefreshButton />

      <p className="mt-8 text-xs text-neutral-600">
        Bookmark this page to refresh the feed any time. It&apos;s reachable only
        behind your Vercel login, so only you can run it.
      </p>
    </div>
  );
}
