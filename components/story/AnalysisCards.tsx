import type { AnalysisCard } from '@/types';

export function AnalysisCards({ cards }: { cards: AnalysisCard[] }) {
  if (!cards.length) return null;
  return (
    <section>
      <h2 className="kicker mb-3 border-b border-[#f0c24c]/40 pb-2 text-xs font-bold text-[var(--gold)]">
        Analysis
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#141414] p-4 ring-1 ring-white/5"
          >
            <span
              className="kicker mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: 'rgba(240,194,76,0.15)', color: 'var(--gold)' }}
            >
              {card.tag}
            </span>
            <h3 className="mb-1.5 font-display text-base font-semibold text-neutral-100">
              {card.title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-400">
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
