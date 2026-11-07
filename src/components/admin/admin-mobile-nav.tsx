'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AdminSidebar } from './admin-sidebar';

/** Drawer version of the admin sidebar for screens below `lg`. */
export function AdminMobileNav({ badges }: { badges: { orders: number; messages: number } }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label="Open admin menu" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] gap-0 overflow-y-auto bg-navy p-0 text-white">
        <SheetTitle className="sr-only">Admin menu</SheetTitle>
        <AdminSidebar badges={badges} />
      </SheetContent>
    </Sheet>
  );
}
