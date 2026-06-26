'use client';

import { useState, useTransition } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { askSpawnDeeper } from '@/app/story/[id]/actions';

// "Spawn Deeper" — ask a question about the story and get an AI answer grounded
// in its context (product spec §10). Fully functional via a server action.
export function SpawnDeeper({ storyId }: { storyId: string }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function ask() {
    if (!question.trim() || pending) return;
    setAnswer(null);
    setError(null);
    startTransition(async () => {
      const res = await askSpawnDeeper(storyId, question);
      if (res.error) setError(res.error);
      else setAnswer(res.answer ?? null);
    });
  }

  return (
    <section className="rounded-2xl bg-[#16181c] p-4 ring-1 ring-white/5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">
          Spawn Deeper
        </h2>
      </div>
      <p className="mb-3 text-sm text-neutral-400">
        Ask anything about this story and get an AI answer grounded in the
        coverage.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={300}
          placeholder="What does this mean for the franchise?"
          className="flex-1 rounded-full bg-black px-4 py-2 text-sm text-neutral-200 ring-1 ring-white/10 placeholder:text-neutral-600 focus:outline-none focus:ring-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={pending || !question.trim()}
          className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Ask
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-[#ef4444]">{error}</p>
      ) : answer ? (
        <div className="mt-3 rounded-xl bg-black/40 p-3 text-sm leading-relaxed text-neutral-200 ring-1 ring-white/5">
          {answer}
        </div>
      ) : null}
    </section>
  );
}
