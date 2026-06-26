'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Flame, Gamepad2, Home, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/rankings', label: 'Popular', icon: Flame },
  { href: '/esports', label: 'Esports', icon: Gamepad2 },
  { href: '/releases', label: 'Releases', icon: CalendarDays },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="SPAWN home">
      <span className="grid grid-cols-2 gap-[3px]">
        <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
        <span className="h-2 w-2 rounded-full bg-white/80" />
        <span className="h-2 w-2 rounded-full bg-white/80" />
        <span className="h-2 w-2 rounded-full bg-white/30" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-white">
        SPAWN
      </span>
    </Link>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop left rail */}
      <aside className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col gap-1 border-r border-[var(--line)] px-3 py-4 lg:flex xl:w-[256px]">
        <div className="mb-4 px-2 xl:px-3">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-4 rounded-full px-3 py-2.5 text-lg transition-colors hover:bg-white/5 xl:px-4',
                  active
                    ? 'bg-white/10 font-bold text-white'
                    : 'font-medium text-neutral-300',
                )}
              >
                <Icon
                  className="h-6 w-6 shrink-0 text-current"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="hidden xl:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom anchor so the full-height rail reads as a complete unit. */}
        <div className="mt-auto px-3 text-[11px] leading-relaxed text-neutral-600 xl:px-4">
          <p className="hidden xl:block">
            SPAWN — gaming news as it happens.
          </p>
          <p className="hidden xl:block">© 2026</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-[calc(3.5rem_+_env(safe-area-inset-top))] items-center gap-3 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <Logo />
        <form action="/" method="get" className="ml-auto flex-1 sm:max-w-xs">
          <div className="flex items-center gap-2 rounded-full bg-[#16181c] px-3 py-1.5 ring-1 ring-transparent focus-within:ring-[var(--accent)]">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              name="q"
              placeholder="Search"
              className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </form>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[var(--line)] bg-[var(--header-bg)] pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-1 flex-col items-center gap-0.5 py-2"
            >
              <Icon
                className={cn('h-6 w-6', active ? 'text-white' : 'text-neutral-500')}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] leading-none',
                  active ? 'font-semibold text-white' : 'text-neutral-500',
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
