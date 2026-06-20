import { Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/utils';

// "Spawn Deeper" Q&A widget (product spec §10). Submission + AI answers (a Pro
// feature) land in Phase 2; Phase 1 ships the prompt surface.
export function SpawnDeeper() {
  return (
    <section className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: BRAND }} />
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Spawn Deeper
        </h2>
      </div>
      <p className="mb-3 text-sm text-neutral-400">
        Ask a question about this story. Pro members get an AI-generated answer.
      </p>
      <div className="flex gap-2">
        <input
          disabled
          placeholder="What does this mean for the franchise?"
          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-300 placeholder:text-neutral-600 disabled:opacity-60"
        />
        <button
          disabled
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm font-semibold text-neutral-400"
          type="button"
        >
          Ask
        </button>
      </div>
      <p className="mt-2 text-[11px] text-neutral-600">Coming in Phase 2.</p>
    </section>
  );
}
