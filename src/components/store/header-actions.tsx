'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, User } from 'lucide-react';
import { useCart, useWishlist } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';

export function HeaderActions({ signedIn, name }: { signedIn: boolean; name?: string }) {
  const mounted = useMounted();
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);

  const item = 'relative flex min-w-10 flex-col items-center justify-center gap-1 rounded-lg p-1.5 text-[13px] text-white hover:text-sky-brand sm:min-w-16 sm:px-1 sm:py-1';
  const label = 'hidden sm:inline';
  const bubble = 'absolute -top-0.5 right-0 flex sm:-top-1 sm:right-2 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white';

  return (
    <nav aria-label="Account" className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
      <Link href={signedIn ? '/account' : '/login'} className={item} aria-label={signedIn ? 'My account' : 'Sign in'}>
        <User className="h-6 w-6" strokeWidth={1.8} />
        <span aria-hidden="true" className={`${label} max-w-[80px] truncate`}>{signedIn ? name?.split(' ')[0] || 'Account' : 'Account'}</span>
      </Link>
      <Link href="/wishlist" className={item} aria-label={`Wishlist${mounted && wishCount ? `, ${wishCount} items` : ''}`}>
        <Heart className="h-6 w-6" strokeWidth={1.8} />
        <span aria-hidden="true" className={label}>Wishlist</span>
        {mounted && wishCount > 0 && <span className={bubble} aria-hidden="true">{wishCount}</span>}
      </Link>
      <Link href="/cart" className={item} aria-label={`Cart${mounted ? `, ${cartCount} items` : ''}`}>
        <ShoppingCart className="h-6 w-6" strokeWidth={1.8} />
        <span aria-hidden="true" className={label}>Cart</span>
        {mounted && cartCount > 0 && <span className={bubble} aria-hidden="true">{cartCount}</span>}
      </Link>
    </nav>
  );
}
