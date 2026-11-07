import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductGrid } from '@/components/store/product-card';
import { WishlistView } from '@/components/store/wishlist-view';
import { getFeaturedProducts } from '@/lib/queries';

export const metadata: Metadata = { title: 'Wishlist' };

export default async function WishlistPage() {
  const recs = await getFeaturedProducts(4);
  return (
    <main className="container flex flex-col gap-6 py-6 pb-14">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />
      <h1 className="text-3xl font-semibold">My Wishlist</h1>
      <WishlistView />
      {recs.length > 0 && (
        <section className="flex flex-col gap-5 pt-4">
          <h2 className="text-[22px] font-semibold">Recommended for you</h2>
          <ProductGrid products={recs} className="xl:grid-cols-4" />
        </section>
      )}
    </main>
  );
}
