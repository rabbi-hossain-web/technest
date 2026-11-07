import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { initials } from '@/lib/utils';
import { AdminMobileNav } from './admin-mobile-nav';

export function AdminTopbar({ name, pending, badges }: { name: string; pending: number; badges: { orders: number; messages: number } }) {
  return (
    <div className="flex min-h-[64px] flex-wrap items-center gap-x-3 gap-y-3 border-b bg-white px-4 py-3 sm:min-h-[72px] sm:gap-x-5 sm:px-7">
      <AdminMobileNav badges={badges} />
      <form action="/admin/orders" role="search" className="relative order-last flex w-full items-center sm:order-none sm:w-auto sm:max-w-md sm:flex-[1_1_260px]">
        <Search className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-slate-500" />
        <input
          type="search"
          name="q"
          aria-label="Search orders"
          placeholder="Search orders by number, name or email…"
          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <Link href="/admin/orders?status=pending" aria-label={`${pending} pending orders`} className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100">
          <Bell className="h-5 w-5" strokeWidth={1.8} />
          {pending > 0 && <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-600" />}
        </Link>
        <Link href="/admin/settings" aria-label={`${name}, settings`} className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-slate-100">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-accent-foreground">{initials(name)}</span>
          <span className="hidden flex-col sm:flex"><strong className="text-sm font-semibold">{name}</strong><span className="text-xs text-muted-foreground">Administrator</span></span>
        </Link>
      </div>
    </div>
  );
}
