import type { AnalysisCard } from '@/types';

export function AnalysisCards({ cards }: { cards: AnalysisCard[] }) {
  if (!cards.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
        Analysis
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#151517] p-4 ring-1 ring-white/5"
          >
            <span
              className="mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(255,45,77,0.15)', color: '#ff2d4d' }}
            >
              {card.tag}
            </span>
            <h3 className="font-display mb-1.5 text-sm font-semibold uppercase text-neutral-100">
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
