'use client';

import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { ProductImage } from '@/components/shared/product-image';
import { Stars } from '@/components/shared/stars';
import { Badge } from '@/components/ui/badge';
import { useCart, useWishlist } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';
import { cn, discountPercent, formatPrice } from '@/lib/utils';
import type { ProductDTO } from '@/types';

export type CardProduct = Pick<ProductDTO, '_id' | 'name' | 'slug' | 'price' | 'compareAtPrice' | 'images' | 'art' | 'rating' | 'numReviews' | 'stock' | 'badge'>;

export function ProductCard({ product }: { product: CardProduct }) {
  const add = useCart((s) => s.add);
  const mounted = useMounted();
  const wished = useWishlist((s) => s.ids.includes(product._id));
  const toggle = useWishlist((s) => s.toggle);
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;
  const badge = product.badge || (off >= 10 ? `-${off}%` : '');

  return (
    <article className="relative flex h-full min-w-0 flex-col gap-2.5 rounded-xl border bg-white p-2.5 sm:p-3.5 transition-shadow hover:shadow-md">
      {badge && (
        <Badge variant={product.badge ? 'bestseller' : 'danger'} className="absolute left-3 top-3 z-10 text-[11px]">
          {badge}
        </Badge>
      )}
      <button
        type="button"
        aria-label={mounted && wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={mounted && wished}
        onClick={() => {
          const now = toggle(product._id);
          toast.success(now ? 'Saved to wishlist' : 'Removed from wishlist');
        }}
        className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-600 hover:text-red-600"
      >
        <Heart className={cn('h-4 w-4', mounted && wished && 'fill-red-500 text-red-500')} />
      </button>
      <Link href={`/product/${product.slug}`} className="flex flex-col gap-3">
        <div className="relative h-[120px] px-2 pt-2 sm:h-[150px] sm:px-3">
          <ProductImage src={product.images?.[0]?.url} art={product.art} alt={product.name} />
        </div>
        <h3 className="line-clamp-2 min-h-10 font-sans text-sm font-medium leading-5">{product.name}</h3>
      </Link>
      <div className="flex items-center gap-1.5 text-[13px]">
        <Stars value={product.rating} />
        <span className="text-muted-foreground">({product.rating.toFixed(1)})</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-base font-bold sm:text-lg">{formatPrice(product.price)}</span>
        {off > 0 && <s className="text-[13px] text-slate-500">{formatPrice(product.compareAtPrice!)}</s>}
      </div>
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          add({ productId: product._id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0]?.url, art: product.art, stock: product.stock });
          toast.success('Added to cart', { description: product.name, action: { label: 'View cart', onClick: () => (window.location.href = '/cart') } });
        }}
        className="mt-auto flex h-10 items-center justify-center gap-1.5 rounded-lg px-1 sm:h-11 sm:gap-2 bg-navy text-[13px] font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        <ShoppingCart className="h-4 w-4" />
        {soldOut ? 'Out of stock' : 'Add to Cart'}
      </button>
    </article>
  );
}

export function ProductGrid({ products, className }: { products: CardProduct[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6', className)}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
