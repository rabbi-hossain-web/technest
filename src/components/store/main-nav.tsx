'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/deals', label: 'Deals' },
  { href: '/brands', label: 'Brands' },
  { href: '/support', label: 'Support' },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden flex-wrap gap-x-9 md:flex">
      {NAV_LINKS.map((l) => {
        const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-[52px] items-center border-b-2 text-sm font-medium transition-colors',
              active ? 'border-sky-brand text-sky-brand' : 'border-transparent text-white hover:text-sky-brand',
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
