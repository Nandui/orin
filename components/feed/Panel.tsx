// Right-rail editorial panel: a small-caps section label over a gold rule.
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
    <section className="rounded-3xl bg-[#141414] p-4 ring-1 ring-white/5">
      <div className="mb-4 flex items-center justify-between border-b border-[#f0c24c]/40 pb-2">
        <h2 className="kicker text-xs font-bold text-[var(--gold)]">{title}</h2>
        {count !== undefined && count !== '' ? (
          <span className="text-[11px] font-medium text-neutral-500">{count}</span>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
