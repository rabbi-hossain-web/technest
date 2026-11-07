import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { CartView } from '@/components/store/cart-view';
import { getSettings } from '@/lib/queries';

export const metadata: Metadata = { title: 'Cart' };

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <main className="container flex flex-col gap-6 py-6 pb-14">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
      <h1 className="text-3xl font-semibold">Shopping Cart</h1>
      <CartView settings={settings} />
    </main>
  );
}
