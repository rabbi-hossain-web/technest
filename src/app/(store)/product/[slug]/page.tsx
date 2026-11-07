import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { ProductGallery } from '@/components/store/product-gallery';
import { ProductPurchase } from '@/components/store/product-purchase';
import { ReviewForm } from '@/components/store/review-form';
import { Stars } from '@/components/shared/stars';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSession } from '@/lib/auth';
import { getProductBySlug, getRelatedProducts, getReviews, getSettings } from '@/lib/queries';
import { discountPercent, formatDate, formatPrice, initials } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: 'Product not found' };
  return {
    title: p.name,
    description: p.shortDescription || p.description.slice(0, 160),
    openGraph: p.images[0] ? { images: [p.images[0].url] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const product = await getProductBySlug(slug, session?.role === 'admin');
  if (!product) notFound();

  const [reviews, related, settings] = await Promise.all([getReviews(product._id), getRelatedProducts(product), getSettings()]);
  const off = discountPercent(product.price, product.compareAtPrice);
  const dist = [5, 4, 3, 2, 1].map((s) => {
    const n = reviews.filter((r) => r.rating === s).length;
    return { s, p: reviews.length ? Math.round((n / reviews.length) * 100) : 0 };
  });

  return (
    <main className="container flex flex-col gap-10 py-6 pb-14">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          ...(product.category ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }] : [{ label: 'Shop', href: '/shop' }]),
          { label: product.name },
        ]}
      />
      {product.status !== 'active' && (
        <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900">Admin preview — this product is <strong>{product.status}</strong> and hidden from customers.</p>
      )}

      <section className="flex flex-wrap items-start gap-6 sm:gap-10">
        <div className="min-w-0 flex-[1_1_320px]">
          <ProductGallery images={product.images} art={product.art} name={product.name} badge={product.badge || (off ? `-${off}%` : undefined)} />
        </div>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
          <div className="flex flex-col gap-2">
            {product.brand && (
              <Link href={`/shop?brand=${encodeURIComponent(product.brand)}`} className="text-[13px] font-semibold uppercase tracking-wider text-primary">
                {product.brand}
              </Link>
            )}
            <h1 className="text-2xl font-semibold leading-tight sm:text-[32px]">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <Stars value={product.rating} size={16} />
              <span>{product.rating.toFixed(1)} out of 5</span>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href="#reviews" className="text-primary hover:underline">{product.numReviews} reviews</a>
              <span className="text-slate-300" aria-hidden="true">|</span>
              {product.stock > 0 ? (
                <span className={product.stock <= 5 ? 'font-semibold text-amber-700' : 'font-semibold text-green-700'}>{product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}</span>
              ) : (
                <span className="font-semibold text-red-700">Out of stock</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-[28px] font-bold sm:text-[32px]">{formatPrice(product.price, settings.currency)}</span>
            {off > 0 && (
              <>
                <s className="text-lg text-slate-500">{formatPrice(product.compareAtPrice!, settings.currency)}</s>
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-[13px] font-bold text-red-800">Save {off}%</span>
              </>
            )}
          </div>
          {product.shortDescription && <p className="text-[15px] leading-relaxed text-slate-700">{product.shortDescription}</p>}

          <ProductPurchase product={product} />

          <ul className="flex flex-col gap-3.5 rounded-xl border p-4 text-sm sm:p-5">
            <li className="flex items-start gap-3"><Truck className="h-5 w-5 shrink-0 text-primary" /><span><strong className="font-semibold">Free delivery</strong> on orders over {formatPrice(settings.freeShippingThreshold, settings.currency)}.</span></li>
            <li className="flex items-start gap-3"><RotateCcw className="h-5 w-5 shrink-0 text-primary" /><span><strong className="font-semibold">7-day returns</strong> — free and hassle-free.</span></li>
            <li className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><span><strong className="font-semibold">Manufacturer warranty</strong> included. SKU {product.sku || '—'}</span></li>
          </ul>
        </div>
      </section>

      <section id="reviews" className="scroll-mt-6">
        <Tabs defaultValue="description">
          <TabsList aria-label="Product information">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.numReviews})</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <div className="max-w-3xl whitespace-pre-line text-[15px] leading-7 text-slate-800">{product.description || 'No description yet.'}</div>
          </TabsContent>
          <TabsContent value="specs">
            {product.specs.length ? (
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((s) => (
                      <tr key={s.key} className="border-b last:border-0">
                        <th scope="row" className="w-1/3 bg-slate-50 px-3 py-3 text-left font-semibold sm:px-5 sm:py-3.5">{s.key}</th>
                        <td className="break-words px-3 py-3 sm:px-5 sm:py-3.5">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications listed.</p>
            )}
          </TabsContent>
          <TabsContent value="reviews">
            <div className="flex flex-wrap items-start gap-8">
              <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
                <div className="flex flex-col gap-3 rounded-xl bg-secondary p-5">
                  <span className="text-[44px] font-bold leading-none">{product.rating.toFixed(1)}</span>
                  <Stars value={product.rating} size={18} />
                  <span className="text-[13px] text-muted-foreground">Based on {product.numReviews} reviews</span>
                  {dist.map((d) => (
                    <div key={d.s} className="flex items-center gap-2.5 text-[13px]">
                      <span className="w-7">{d.s}★</span>
                      <span className="h-2 flex-1 overflow-hidden rounded bg-slate-200"><span className="block h-full bg-star" style={{ width: `${d.p}%` }} /></span>
                      <span className="w-9 text-right text-muted-foreground">{d.p}%</span>
                    </div>
                  ))}
                </div>
                {session ? (
                  <ReviewForm productId={product._id} slug={product.slug} />
                ) : (
                  <Button asChild variant="outline"><Link href={`/login?next=/product/${product.slug}`}>Sign in to write a review</Link></Button>
                )}
              </div>
              <ul className="flex min-w-0 flex-[2_1_300px] flex-col gap-4">
                {reviews.length === 0 && <li className="text-muted-foreground">No reviews yet — be the first.</li>}
                {reviews.map((r) => (
                  <li key={r._id} className="flex flex-col gap-2 border-b pb-4">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{initials(r.name)}</span>
                      <div className="flex min-w-0 flex-col">
                        <strong className="truncate text-sm font-semibold">{r.name}</strong>
                        <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                      </div>
                      <Stars value={r.rating} className="ml-auto" />
                    </div>
                    <strong className="text-[15px] font-semibold">{r.title}</strong>
                    <p className="text-sm leading-relaxed text-slate-700">{r.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {related.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
