import type { Sentiment } from '@/types';

export function SentimentBar({ sentiment }: { sentiment: Sentiment }) {
  const pos = Math.max(0, Math.min(100, sentiment.pos));
  const neg = Math.max(0, Math.min(100, sentiment.neg));

  return (
    <section className="rounded-2xl bg-[#16181c] p-4 ring-1 ring-white/5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--accent)]">
        Community Sentiment
      </h3>
      <div className="mb-2 flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full bg-green-500" style={{ width: `${pos}%` }} />
        <div className="h-full bg-[#ef4444]" style={{ width: `${neg}%` }} />
      </div>
      <div className="mb-3 flex justify-between text-[11px] font-semibold">
        <span className="text-green-400">{pos.toFixed(1)}% positive</span>
        <span className="text-[#ef4444]">{neg.toFixed(1)}% negative</span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-300">{sentiment.text}</p>
    </section>
  );
}
