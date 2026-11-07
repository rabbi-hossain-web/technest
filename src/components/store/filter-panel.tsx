'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Filters sidebar: always open on desktop, collapsible on phones/tablets so products stay above the fold. */
export function FilterPanel({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <aside aria-label="Filters" className="flex flex-col rounded-xl border p-4 sm:p-5 lg:w-[260px] lg:shrink-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="hidden font-sans text-base font-semibold lg:block">Filters</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="shop-filters"
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-9 items-center gap-2 text-base font-semibold lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && <span className="rounded-full bg-primary px-2 text-xs font-bold text-white">{activeCount}</span>}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
        <Link href="/shop" className="text-[13px] font-medium text-primary hover:underline">Clear all</Link>
      </div>
      <div id="shop-filters" className={cn('mt-5 flex-col gap-5 lg:flex', open ? 'flex' : 'hidden')}>
        {children}
      </div>
    </aside>
  );
}
