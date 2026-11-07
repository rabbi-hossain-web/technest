'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, FolderTree, LayoutDashboard, LogOut, Mail, Package, Settings, ShoppingBag, Tag, Users } from 'lucide-react';
import { adminLogoutAction } from '@/actions/auth';
import { LogoMark } from '@/components/shared/logo';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'orders' as const },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/messages', label: 'Messages', icon: Mail, badgeKey: 'messages' as const },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ badges }: { badges: { orders: number; messages: number } }) {
  const pathname = usePathname();
  return (
    <aside aria-label="Admin navigation" className="flex h-full flex-col gap-6 px-3.5 py-5 text-slate-300">
      <Link href="/admin" className="flex items-center gap-2.5 px-2 text-white">
        <LogoMark size={34} />
        <span className="font-display text-xl font-semibold">TechNest</span>
        <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">Admin</span>
      </Link>
      <nav className="flex flex-col gap-0.5">
        {ITEMS.map(({ href, label, icon: Icon, exact, badgeKey }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badge = badgeKey ? badges[badgeKey] : 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors', active ? 'bg-primary text-white' : 'hover:bg-white/5 hover:text-white')}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {badge > 0 && <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-amber-950">{badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-white/10 pt-4">
        <Link href="/" className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.8} /> View storefront
        </Link>
        <form action={adminLogoutAction}>
          <button type="submit" className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm hover:bg-white/5 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} /> Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
