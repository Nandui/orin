'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CalendarDays, Gamepad2, House } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', icon: House, label: 'Feed' },
  { href: '/rankings', icon: BarChart3, label: 'Rankings' },
  { href: '/esports', icon: Gamepad2, label: 'Esports' },
  { href: '/releases', icon: CalendarDays, label: 'Releases' },
];

// Horizontal nav for mobile (the icon rail is desktop-only).
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active =
          href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-[#ff2d4d] text-white'
                : 'bg-[#151517] text-neutral-400',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
