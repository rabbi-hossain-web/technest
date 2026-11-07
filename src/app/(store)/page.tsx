import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductArt } from '@/components/shared/product-art';
import { ProductImage } from '@/components/shared/product-image';
import { ProductGrid } from '@/components/store/product-card';
import { SectionHeading } from '@/components/store/section-heading';
import { Button } from '@/components/ui/button';
import { getBestseller, getBrands, getCategories, getFeaturedProducts } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

export default async function HomePage() {
  const [categories, products, bestseller, brands] = await Promise.all([getCategories(), getFeaturedProducts(6), getBestseller(), getBrands()]);

  return (
    <>
      <main className="container flex flex-col gap-12 py-6 pb-14">
        {/* Hero */}
        <section
          aria-label="Featured"
          className="relative flex flex-wrap items-center gap-8 overflow-hidden rounded-2xl px-5 py-10 sm:px-12 sm:py-12"
          style={{ background: 'radial-gradient(ellipse at 70% 40%, #1C3563 0%, #0B1730 62%)' }}
        >
          <div className="relative z-10 flex flex-[1_1_300px] flex-col gap-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#9CC7FF]">Latest tech. Best prices.</p>
            <h1 className="text-4xl font-bold leading-[1.08] text-white sm:text-[52px]">
              Upgrade Your
              <br />
              <span className="text-sky-brand">Digital Life</span>
            </h1>
            <p className="max-w-md text-[17px] leading-relaxed text-slate-300">Discover the newest gadgets, top brands and exclusive deals — all in one place.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" shape="pill"><Link href="/shop">Shop Now <ArrowRight /></Link></Button>
              <Button asChild size="lg" shape="pill" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link href="/deals">View Deals</Link>
              </Button>
            </div>
          </div>
          <div aria-hidden="true" className="relative h-[220px] flex-[1.3_1_280px] sm:h-[300px] sm:flex-[1.3_1_420px]">
            <div className="absolute left-[24%] top-0 w-1/2"><ProductArt kind="laptop" /></div>
            <div className="absolute left-0 top-[24%] w-[34%]"><ProductArt kind="headphones" /></div>
            <div className="absolute left-[62%] top-[22%] w-[26%]"><ProductArt kind="phone" /></div>
            <div className="absolute left-[44%] top-[62%] w-[20%]"><ProductArt kind="earbuds" /></div>
            <div className="absolute left-[82%] top-1/2 w-[18%]"><ProductArt kind="watch" /></div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="flex flex-col gap-5">
            <SectionHeading title="Shop by Category" href="/shop" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(132px,1fr))] sm:gap-4">
              {categories.map((c) => (
                <Link key={c._id} href={`/shop?category=${c.slug}`} className="group flex flex-col gap-3 text-center">
                  <div className="relative flex h-[92px] items-center justify-center rounded-xl bg-[#EEF4FC] px-4 py-3 sm:h-[108px] sm:px-6 transition group-hover:bg-accent">
                    {c.image?.url ? <ProductImage src={c.image.url} alt={c.name} /> : <ProductArt kind={c.art} className="max-w-[110px]" />}
                  </div>
                  <span className="text-sm leading-snug">{c.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Promotions */}
        <section aria-label="Promotions" className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-[#E6F0FD] p-6 sm:p-8">
            <div className="flex flex-[1_1_220px] flex-col gap-3">
              <span className="self-start rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#0F3E8A]">Limited time offer</span>
              <h2 className="text-3xl font-bold">Up to 40% Off</h2>
              <p className="text-[17px] text-slate-800">Top Laptops &amp; Accessories</p>
              <Button asChild shape="pill" className="mt-2 self-start"><Link href="/deals">Shop Deals <ArrowRight /></Link></Button>
            </div>
            <div aria-hidden="true" className="relative h-[170px] flex-[1_1_200px]">
              <div className="absolute left-0 top-0 w-[82%]"><ProductArt kind="laptop" /></div>
              <div className="absolute bottom-0 right-0 w-[28%]"><ProductArt kind="mouse" /></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-[#0F1A2E] p-6 text-white sm:p-8">
            {bestseller ? (
              <>
                <div className="flex flex-[1_1_240px] flex-col gap-3">
                  <span className="self-start rounded-full border border-white/30 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest">Bestseller</span>
                  <h2 className="text-[26px] font-semibold">{bestseller.name}</h2>
                  {bestseller.shortDescription && <p className="text-slate-300">{bestseller.shortDescription}</p>}
                  <p className="mt-1 flex items-baseline gap-3">
                    <span className="text-[26px] font-bold">{formatPrice(bestseller.price)}</span>
                    {bestseller.compareAtPrice && <s className="text-sm text-slate-400">{formatPrice(bestseller.compareAtPrice)}</s>}
                  </p>
                  <Button asChild variant="white" shape="pill" className="mt-2 self-start"><Link href={`/product/${bestseller.slug}`}>Shop Now <ArrowRight /></Link></Button>
                </div>
                <div className="relative h-40 min-w-[150px] flex-[1_1_200px] sm:flex-[0_1_200px]">
                  <ProductImage src={bestseller.images?.[0]?.url} art={bestseller.art} alt={bestseller.name} />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <h2 className="text-[26px] font-semibold">New arrivals every week</h2>
                <Button asChild variant="white" shape="pill" className="self-start"><Link href="/shop?sort=newest">Browse new</Link></Button>
              </div>
            )}
          </div>
        </section>

        {/* Popular */}
        <section className="flex flex-col gap-5">
          <SectionHeading title="Popular Products" href="/shop" />
          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No products yet. Run <code>npm run seed</code> or add products in the admin panel.</p>
          )}
        </section>
      </main>

      {brands.length > 0 && (
        <section aria-label="Top brands" className="bg-secondary">
          <div className="container flex flex-wrap items-center gap-x-12 gap-y-6 py-8">
            <div className="flex-[0_1_240px]">
              <h2 className="text-xl font-semibold">Top Brands</h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground">Shop from the world&apos;s most trusted brands.</p>
            </div>
            <ul className="flex flex-[1_1_280px] flex-wrap items-center gap-x-8 gap-y-4 sm:flex-[1_1_520px] sm:justify-between sm:gap-y-5">
              {brands.slice(0, 8).map((b) => (
                <li key={b}>
                  <Link href={`/shop?brand=${encodeURIComponent(b)}`} className="font-display text-[17px] font-semibold uppercase tracking-wider text-slate-700 hover:text-primary">
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
