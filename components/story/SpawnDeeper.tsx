import { Sparkles } from 'lucide-react';

// "Spawn Deeper" Q&A widget (product spec §10). Submission + AI answers (a Pro
// feature) land in Phase 2; Phase 1 ships the prompt surface.
export function SpawnDeeper() {
  return (
    <section className="rounded-2xl bg-[#141414] p-4 ring-1 ring-white/5">
      <div className="mb-3 flex items-center gap-2 border-b border-[#f0c24c]/40 pb-2">
        <Sparkles className="h-4 w-4 text-[var(--gold)]" />
        <h2 className="kicker text-xs font-bold text-[var(--gold)]">
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
          className="flex-1 rounded-full bg-[#0f0f11] px-4 py-2 text-sm text-neutral-300 ring-1 ring-white/5 placeholder:text-neutral-600 disabled:opacity-60"
        />
        <button
          disabled
          className="rounded-full bg-[#252528] px-4 py-2 text-sm font-semibold text-neutral-400"
          type="button"
        >
          Ask
        </button>
      </div>
      <p className="mt-2 text-[11px] text-neutral-600">Coming in Phase 2.</p>
    </section>
  );
}
