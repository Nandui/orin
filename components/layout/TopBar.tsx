import Link from 'next/link';
import { Bell, Gamepad2, Search, ShoppingBag } from 'lucide-react';

// Top bar (RIM-style): brand mark + search + a community pill + round actions.
export function TopBar() {
  return (
    <header className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
      {/* Brand */}
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff2d4d] shadow-[0_0_22px_-2px_rgba(255,45,77,0.7)]">
          <Gamepad2 className="h-5 w-5 text-white" strokeWidth={2.5} />
        </span>
        <span className="font-display text-2xl font-bold tracking-wide text-white">
          SPAWN
        </span>
      </Link>

      {/* Search */}
      <form action="/" method="get" className="hidden flex-1 sm:block sm:max-w-md">
        <div className="flex items-center gap-2 rounded-full bg-[#151517] px-4 py-2.5 ring-1 ring-white/5">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            name="q"
            placeholder="What are you looking for?"
            className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </form>

      {/* Community pill (decorative) */}
      <div className="ml-auto hidden items-center gap-2 rounded-full bg-[#151517] py-1.5 pl-1.5 pr-4 ring-1 ring-white/5 lg:flex">
        <span className="h-7 w-7 rounded-full bg-gradient-to-br from-[#ff2d4d] to-[#7c2bff]" />
        <span className="text-sm text-neutral-300">
          <span className="font-semibold text-white">SPAWN</span> · ranked by the
          community
        </span>
      </div>

      {/* Actions */}
      <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#151517] text-neutral-300 ring-1 ring-white/5"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ff2d4d] ring-2 ring-[#1d1d20]" />
        </button>
        <button
          type="button"
          aria-label="Library"
          className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-[#151517] text-neutral-300 ring-1 ring-white/5 sm:flex"
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#1d1d20]" />
        </button>
        <span className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7c2bff] via-[#ff2d4d] to-[#ff7a2d] ring-2 ring-white/10" />
      </div>
    </header>
  );
}
