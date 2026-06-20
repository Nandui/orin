import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/utils';

const NAV = [
  { label: 'Feed', href: '/' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Releases', href: '/releases' },
  { label: 'Esports', href: '/esports' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-[#0a0a0f]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-black tracking-tight text-white">
            SPAWN
          </span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: BRAND }}
          >
            /Gaming
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form action="/" method="get" className="ml-auto hidden flex-1 sm:block sm:max-w-xs">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              name="q"
              placeholder="Search stories…"
              className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>
        </form>

        {/* Pro */}
        <button
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:border-neutral-500"
          type="button"
        >
          <Sparkles className="h-4 w-4" style={{ color: BRAND }} />
          <span className="hidden sm:inline">Go Pro</span>
        </button>
      </div>
    </header>
  );
}
