import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { escapeRegex } from '@/lib/utils';
import { Product } from '@/models';

export const runtime = 'nodejs';

/** Live search suggestions for the header search bar. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 80) ?? '';
  if (q.length < 2) return NextResponse.json({ products: [], total: 0 });

  await connectDB();
  const rx = new RegExp(escapeRegex(q), 'i');
  const query = { status: 'active', $or: [{ name: rx }, { brand: rx }, { tags: rx }] };
  const [docs, total] = await Promise.all([
    Product.find(query)
      .select('name slug price compareAtPrice images art brand')
      .sort({ sold: -1, rating: -1 })
      .limit(6)
      .lean(),
    Product.countDocuments(query),
  ]);

  const products = docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    slug: d.slug,
    brand: d.brand,
    price: d.price,
    compareAtPrice: d.compareAtPrice ?? null,
    image: d.images?.[0]?.url ?? null,
    art: d.art,
  }));
  return NextResponse.json({ products, total });
}
