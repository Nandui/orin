import { ArrowRight } from 'lucide-react';

// Right-rail panel (Clans / Nearest Events / Who to Watch style).
export function Panel({
  title,
  count,
  children,
}: {
  title: string;
  count?: string | number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-[#141417] p-4 ring-1 ring-white/5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {count !== undefined && count !== '' ? (
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-neutral-400">
              {count}
            </span>
          ) : null}
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-neutral-400">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
