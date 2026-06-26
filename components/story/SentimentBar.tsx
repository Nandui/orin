import type { Sentiment } from '@/types';

export function SentimentBar({ sentiment }: { sentiment: Sentiment }) {
  const pos = Math.max(0, Math.min(100, sentiment.pos));
  const neg = Math.max(0, Math.min(100, sentiment.neg));

  return (
    <section className="rounded-2xl bg-[#141414] p-4 ring-1 ring-white/5">
      <h2 className="kicker mb-3 border-b border-[#f0c24c]/40 pb-2 text-xs font-bold text-[var(--gold)]">
        Community Sentiment
      </h2>
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
