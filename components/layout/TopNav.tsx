'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/esports', label: 'Esports' },
  { href: '/releases', label: 'Releases' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0c]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid grid-cols-2 gap-[3px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2f6bff]" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            SPAWN
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-sm font-medium transition-colors',
                  active ? 'text-white' : 'text-neutral-400 hover:text-white',
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#2f6bff]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <form action="/" method="get" className="hidden lg:block">
            <div className="flex items-center gap-2 rounded-xl bg-[#141417] px-3 py-2 ring-1 ring-white/5">
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                name="q"
                placeholder="Search…"
                className="w-40 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
              />
            </div>
          </form>

          <button
            type="button"
            aria-label="Messages"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#141417] text-neutral-300 ring-1 ring-white/5"
          >
            <MessageSquare className="h-[18px] w-[18px]" />
            <span className="absolute -right-1 -top-1 rounded-full bg-[#ef4444] px-1.5 text-[10px] font-bold text-white">
              9+
            </span>
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#141417] text-neutral-300 ring-1 ring-white/5"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-[#0a0a0c]" />
          </button>

          <div className="flex items-center gap-2">
            <span className="relative h-9 w-9 rounded-full bg-gradient-to-br from-[#2f6bff] via-[#6b3bff] to-[#ef4444] ring-1 ring-white/10">
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#0a0a0c]" />
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-white">Guest</p>
              <p className="text-[11px] text-neutral-500">@spawn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav row */}
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[#2f6bff] text-white'
                  : 'bg-[#141417] text-neutral-400',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
