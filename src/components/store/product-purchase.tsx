'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart, useWishlist } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import type { ProductDTO } from '@/types';

export function QuantityStepper({ value, onChange, max = 20, label = 'quantity', size = 'lg' }: { value: number; onChange: (n: number) => void; max?: number; label?: string; size?: 'lg' | 'sm' }) {
  const h = size === 'lg' ? 'h-[52px]' : 'h-11';
  return (
    <div className={cn('flex items-center rounded-lg border border-input', h)}>
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(1, value - 1))} className={cn('flex w-11 items-center justify-center disabled:opacity-40', h)} disabled={value <= 1}>
        <Minus className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="min-w-8 text-center font-semibold">{value}</span>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))} className={cn('flex w-11 items-center justify-center disabled:opacity-40', h)} disabled={value >= max}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProductPurchase({ product }: { product: ProductDTO }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const mounted = useMounted();
  const wished = useWishlist((s) => s.ids.includes(product._id));
  const toggle = useWishlist((s) => s.toggle);
  const soldOut = product.stock <= 0;
  const max = Math.max(1, Math.min(product.stock, 20));

  const addToCart = () => {
    add({ productId: product._id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0]?.url, art: product.art, stock: product.stock }, qty);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!soldOut && <QuantityStepper value={qty} onChange={setQty} max={max} />}
      <Button
        size="lg"
        variant="navy"
        className="h-[52px] flex-[1_1_180px]"
        disabled={soldOut}
        onClick={() => {
          addToCart();
          toast.success('Added to cart', { description: `${qty} × ${product.name}` });
        }}
      >
        <ShoppingCart /> {soldOut ? 'Out of stock' : 'Add to Cart'}
      </Button>
      {!soldOut && (
        <Button
          size="lg"
          className="h-[52px] flex-[1_1_140px]"
          onClick={() => {
            addToCart();
            router.push('/checkout');
          }}
        >
          Buy Now
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-[52px] w-[52px]"
        aria-label={mounted && wished ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={mounted && wished}
        onClick={() => toast.success(toggle(product._id) ? 'Saved to wishlist' : 'Removed from wishlist')}
      >
        <Heart className={cn(mounted && wished && 'fill-red-500 text-red-500')} />
      </Button>
    </div>
  );
}
