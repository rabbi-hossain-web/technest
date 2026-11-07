'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  art?: string;
  stock: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  coupon: string;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setCoupon: (code: string) => void;
  /** Replace persisted snapshots with fresh server data; drops items that no longer exist. */
  sync: (fresh: Omit<CartItem, 'qty'>[]) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: '',
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          const max = Math.max(1, Math.min(item.stock, 20));
          if (existing) {
            return { items: s.items.map((i) => (i.productId === item.productId ? { ...i, ...item, qty: Math.min(max, i.qty + qty) } : i)) };
          }
          return { items: [...s.items, { ...item, qty: Math.min(max, qty) }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(qty, Math.max(1, Math.min(i.stock, 20)))) } : i)) })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [], coupon: '' }),
      setCoupon: (coupon) => set({ coupon }),
      sync: (fresh) =>
        set((s) => {
          const items: CartItem[] = [];
          for (const i of s.items) {
            const p = fresh.find((f) => f.productId === i.productId) ?? fresh.find((f) => f.slug === i.slug);
            if (!p || p.stock < 1 || items.some((x) => x.productId === p.productId)) continue;
            items.push({ ...p, qty: Math.max(1, Math.min(i.qty, p.stock, 20)) });
          }
          return { items };
        }),
    }),
    { name: 'technest-cart' },
  ),
);

type WishlistState = {
  ids: string[];
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        return !has;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    { name: 'technest-wishlist' },
  ),
);
