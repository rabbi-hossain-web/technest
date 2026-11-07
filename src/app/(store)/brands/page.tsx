import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { connectDB } from '@/lib/db';
import { Product } from '@/models';

export const metadata: Metadata = { title: 'Brands' };

export default async function BrandsPage() {
  await connectDB();
  const rows = await Product.aggregate<{ _id: string; n: number; art: string }>([
    { $match: { status: 'active', brand: { $ne: '' } } },
    { $group: { _id: '$brand', n: { $sum: 1 }, art: { $first: '$art' } } },
    { $sort: { _id: 1 } },
  ]);
  return (
    <main className="container flex flex-col gap-6 py-6 pb-14">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Brands' }]} />
      <h1 className="text-3xl font-semibold">Shop by Brand</h1>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((b) => (
          <li key={b._id}>
            <Link href={`/shop?brand=${encodeURIComponent(b._id)}`} className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border bg-white transition hover:border-primary hover:shadow-sm">
              <span className="font-display text-xl font-semibold uppercase tracking-wider">{b._id}</span>
              <span className="text-[13px] text-muted-foreground">{b.n} products</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
