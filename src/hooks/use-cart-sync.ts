'use client';

import { useEffect } from 'react';
import { refreshCartAction } from '@/actions/products';
import { useCart } from '@/lib/store';

/** Refreshes the persisted cart against the server once on mount (fixes stale ids, prices and stock). */
export function useCartSync() {
  useEffect(() => {
    const items = useCart.getState().items;
    if (!items.length) return;
    let alive = true;
    refreshCartAction(items.map((i) => ({ productId: i.productId, slug: i.slug })))
      .then((fresh) => {
        if (alive) useCart.getState().sync(fresh);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
}
