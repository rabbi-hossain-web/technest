'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getWishlistProductsAction } from '@/actions/products';
import { ProductImage } from '@/components/shared/product-image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart, useWishlist } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';
import { discountPercent, formatPrice } from '@/lib/utils';
import type { ProductDTO } from '@/types';

export function WishlistView() {
  const mounted = useMounted();
  const ids = useWishlist((s) => s.ids);
  const remove = useWishlist((s) => s.remove);
  const add = useCart((s) => s.add);
  const [products, setProducts] = useState<ProductDTO[] | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (!ids.length) return setProducts([]);
    getWishlistProductsAction(ids).then(setProducts);
  }, [mounted, ids]);

  if (!mounted || products === null) return <Skeleton className="h-72 w-full" />;
  if (!products.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
        <p className="text-lg font-semibold">Your wishlist is empty</p>
        <p className="text-muted-foreground">Tap the heart on any product to save it here.</p>
        <Button asChild><Link href="/shop">Browse products</Link></Button>
      </div>
    );
  }

  const toCart = (p: ProductDTO) => add({ productId: p._id, slug: p.slug, name: p.name, price: p.price, image: p.images?.[0]?.url, art: p.art, stock: p.stock });

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="navy"
          onClick={() => {
            products.filter((p) => p.stock > 0).forEach(toCart);
            toast.success('In-stock items added to cart');
          }}
        >
          Add all to cart
        </Button>
      </div>
      <ul className="flex flex-col rounded-xl border">
        {products.map((p) => {
          const off = discountPercent(p.price, p.compareAtPrice);
          return (
            <li key={p._id} className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b p-4 last:border-0 sm:p-5">
              <Link href={`/product/${p.slug}`} aria-label={p.name} className="relative h-[80px] w-24 shrink-0 rounded-lg bg-secondary p-2 sm:h-[100px] sm:w-[120px] sm:p-3">
                <ProductImage src={p.images?.[0]?.url} art={p.art} alt={p.name} sizes="120px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[220px]">
                <Link href={`/product/${p.slug}`} className="text-base font-semibold hover:text-primary">{p.name}</Link>
                <span className={p.stock > 5 ? 'text-[13px] font-semibold text-green-700' : p.stock > 0 ? 'text-[13px] font-semibold text-amber-700' : 'text-[13px] font-semibold text-red-700'}>
                  {p.stock > 5 ? 'In stock' : p.stock > 0 ? `Only ${p.stock} left` : 'Out of stock'}
                </span>
              </div>
              <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-5">
                <div className="flex flex-col sm:min-w-[110px] sm:items-end">
                  <span className="text-lg font-bold">{formatPrice(p.price)}</span>
                  {off > 0 && <span className="text-xs font-semibold text-green-700">{off}% off</span>}
                </div>
                <div className="ml-auto flex gap-2 sm:ml-0">
                <Button
                  disabled={p.stock <= 0}
                  onClick={() => {
                    toCart(p);
                    remove(p._id);
                    toast.success('Moved to cart');
                  }}
                >
                  Move to cart
                </Button>
                <Button variant="outline" size="icon" aria-label={`Remove ${p.name} from wishlist`} onClick={() => remove(p._id)}>
                  <Trash2 className="text-slate-500" />
                </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
