import Link from 'next/link';
import { ChevronDown, Menu, Truck } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { DEFAULT_SETTINGS, getCategories, getSettings } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';
import { HeaderActions } from './header-actions';
import { MainNav } from './main-nav';
import { MobileMenu } from './mobile-menu';
import { SearchBar } from './search-bar';

export async function SiteHeader() {
  const [session, categories, settings] = await Promise.all([
    getSession(),
    getCategories().catch(() => []),
    getSettings().catch(() => DEFAULT_SETTINGS),
  ]);

  return (
    <header className="bg-navy text-white">
      <div className="container flex flex-wrap items-center gap-x-3 gap-y-3 py-3 sm:gap-x-6 sm:py-4 lg:gap-x-10">
        <Logo name={settings.storeName} tagline={settings.tagline} />
        <SearchBar currency={settings.currency} />
        <HeaderActions signedIn={!!session} name={session?.name} />
      </div>
      <div className="border-t border-white/10">
        <div className="container flex min-h-[52px] flex-wrap items-center gap-x-8 gap-y-1 lg:gap-x-14">
          <MobileMenu categories={categories} />
          <div className="group relative hidden md:block">
            <Link href="/shop" className="flex h-[52px] items-center gap-2.5 text-sm font-semibold">
              <Menu className="h-5 w-5" /> All Categories <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            {categories.length > 0 && (
              <div className="invisible absolute left-0 top-full z-40 w-64 rounded-b-xl border bg-white p-2 text-foreground opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {categories.map((c) => (
                  <Link key={c._id} href={`/shop?category=${c.slug}`} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-secondary">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <MainNav />
          <p className="ml-auto hidden items-center gap-2.5 text-xs lg:flex">
            <Truck className="h-5 w-5 text-sky-brand" strokeWidth={1.8} />
            Free Shipping on Orders Over {formatPrice(settings.freeShippingThreshold, settings.currency).replace('.00', '')}
          </p>
        </div>
      </div>
    </header>
  );
}
