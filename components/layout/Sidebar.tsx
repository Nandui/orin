'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  Gamepad2,
  House,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', icon: House, label: 'Feed' },
  { href: '/rankings', icon: BarChart3, label: 'Rankings' },
  { href: '/esports', icon: Gamepad2, label: 'Esports' },
  { href: '/releases', icon: CalendarDays, label: 'Releases' },
];

const DECORATIVE = [Bookmark, Users];

// Floating pill icon-rail (RIM-style). Desktop only; mobile uses <MobileNav>.
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block">
      <nav className="sticky top-4 flex h-fit flex-col items-center gap-1.5 rounded-[28px] bg-[#151517] p-2 ring-1 ring-white/5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={cn(
                'relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors',
                active
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-200',
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-2xl bg-[#ff2d4d] shadow-[0_0_22px_2px_rgba(255,45,77,0.55)]" />
              )}
              <Icon className="relative h-5 w-5" strokeWidth={2.25} />
            </Link>
          );
        })}

        {DECORATIVE.map((Icon, i) => (
          <span
            key={i}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-600"
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </span>
        ))}

        <div className="my-1 h-px w-6 bg-white/10" />

        <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-600">
          <Settings className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-600">
          <LogOut className="h-5 w-5" strokeWidth={2.25} />
        </span>
      </nav>
    </aside>
  );
}
