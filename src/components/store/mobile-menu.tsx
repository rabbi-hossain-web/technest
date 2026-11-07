'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_LINKS } from './main-nav';
import type { CategoryDTO } from '@/types';

export function MobileMenu({ categories }: { categories: CategoryDTO[] }) {
  return (
    <Sheet>
      <SheetTrigger className="flex h-11 items-center gap-2 text-sm font-semibold text-white md:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" /> Menu
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetTitle className="font-display text-lg">Menu</SheetTitle>
        <nav className="flex flex-col">
          {NAV_LINKS.map((l) => (
            <SheetClose asChild key={l.href}>
              <Link href={l.href} className="flex h-11 items-center border-b font-medium">{l.label}</Link>
            </SheetClose>
          ))}
        </nav>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
        <nav className="flex flex-col">
          {categories.map((c) => (
            <SheetClose asChild key={c._id}>
              <Link href={`/shop?category=${c.slug}`} className="flex h-10 items-center text-sm">{c.name}</Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
