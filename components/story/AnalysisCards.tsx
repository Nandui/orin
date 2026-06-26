import type { AnalysisCard } from '@/types';

export function AnalysisCards({ cards }: { cards: AnalysisCard[] }) {
  if (!cards.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--accent)]">
        Analysis
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#16181c] p-4 ring-1 ring-white/5"
          >
            <span
              className="mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: 'rgba(29,155,240,0.15)', color: '#1d9bf0' }}
            >
              {card.tag}
            </span>
            <h3 className="mb-1.5 text-base font-semibold text-neutral-100">
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
