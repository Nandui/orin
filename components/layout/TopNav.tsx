'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Newspaper-style section bar. Section pages + the main gaming categories.
const NAV = [
  { href: '/', label: 'Latest' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/releases', label: 'Releases' },
  { href: '/esports', label: 'Esports' },
  { href: '/?category=RPG', label: 'RPG' },
  { href: '/?category=FPS', label: 'FPS' },
  { href: '/?category=Action', label: 'Action' },
  { href: '/?category=Strategy', label: 'Strategy' },
  { href: '/?category=Indie', label: 'Indie' },
  { href: '/?category=Hardware', label: 'Hardware' },
  { href: '/?category=Industry', label: 'Industry' },
];

function isActive(pathname: string, href: string) {
  if (href.includes('?')) return false; // category links — not path-highlighted
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function TopNav({ today }: { today: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        {/* Masthead row */}
        <div className="relative flex h-20 items-center">
          {/* Left: menu + dateline */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#161616] text-neutral-300 ring-1 ring-white/10"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
            <span className="hidden font-display text-sm text-neutral-400 sm:block">
              {today}
            </span>
          </div>

          {/* Center: nameplate */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-masthead text-3xl leading-none text-white sm:text-4xl"
          >
            SPAWN
          </Link>

          {/* Right: search + subscribe */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <form action="/" method="get" className="hidden lg:block">
              <div className="flex items-center gap-2 rounded-full bg-[#161616] px-4 py-2 ring-1 ring-white/10">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  name="q"
                  placeholder="Search"
                  className="w-36 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
            </form>
            <button
              type="button"
              className="rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-bold text-black transition hover:brightness-105"
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Section bar */}
        <nav className="-mx-1 mb-3 flex gap-1 overflow-x-auto rounded-full bg-[#141414] p-1.5 ring-1 ring-white/5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'kicker shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:text-white',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
