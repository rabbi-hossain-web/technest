import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { SortSelect } from '@/components/store/sort-select';
import { FilterPanel } from '@/components/store/filter-panel';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getBrands, getCategories, getCategoryCounts, getProducts } from '@/lib/queries';
import { cn, firstParam, listParam } from '@/lib/utils';

export const metadata: Metadata = { title: 'Shop' };

type SP = Record<string, string | string[] | undefined>;

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() || '';
  const categorySlug = firstParam(sp.category) || '';
  const brands = listParam(sp.brand);
  const min = firstParam(sp.min);
  const max = firstParam(sp.max);
  const sale = firstParam(sp.sale) === '1';
  const inStock = firstParam(sp.instock) === '1';
  const sort = firstParam(sp.sort) || 'featured';
  const page = Number(firstParam(sp.page) || 1);

  const [result, categories, counts, allBrands] = await Promise.all([
    getProducts({ q, category: categorySlug, brands, min: min ? Number(min) : undefined, max: max ? Number(max) : undefined, sale, inStock, sort, page }),
    getCategories(),
    getCategoryCounts(),
    getBrands(),
  ]);
  const activeCount = (categorySlug ? 1 : 0) + brands.length + (min ? 1 : 0) + (max ? 1 : 0) + (sale ? 1 : 0) + (inStock ? 1 : 0);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const title = q ? `Results for “${q}”` : result.category?.name ?? (sale ? 'On Sale' : 'All Products');

  const catHref = (slug?: string) => {
    const p = new URLSearchParams();
    if (slug) p.set('category', slug);
    if (q) p.set('q', q);
    if (sort !== 'featured') p.set('sort', sort);
    const s = p.toString();
    return s ? `/shop?${s}` : '/shop';
  };

  return (
    <main className="container flex flex-col gap-6 py-6 pb-14">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: title }]} />
      <div>
        <h1 className="break-words text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{result.total} products</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-7">
        <FilterPanel activeCount={activeCount}>

          <nav aria-label="Categories" className="flex flex-col gap-1">
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-slate-700">Category</p>
            <Link href={catHref()} className={cn('flex h-9 items-center justify-between rounded-lg px-2.5 text-sm', !categorySlug ? 'bg-accent font-semibold text-accent-foreground' : 'hover:bg-secondary')}>
              <span>All Products</span><span className="text-xs text-muted-foreground">{total}</span>
            </Link>
            {categories.map((c) => (
              <Link
                key={c._id}
                href={catHref(c.slug)}
                aria-current={categorySlug === c.slug ? 'page' : undefined}
                className={cn('flex h-9 items-center justify-between rounded-lg px-2.5 text-sm', categorySlug === c.slug ? 'bg-accent font-semibold text-accent-foreground' : 'hover:bg-secondary')}
              >
                <span>{c.name}</span><span className="text-xs text-muted-foreground">{counts[c._id] ?? 0}</span>
              </Link>
            ))}
          </nav>

          <form action="/shop" className="flex flex-col gap-5 border-t pt-5">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {q && <input type="hidden" name="q" value={q} />}
            {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-slate-700">Price</legend>
              <div className="flex gap-2">
                <label className="flex flex-1 flex-col gap-1 text-xs text-muted-foreground">Min<Input type="number" name="min" min={0} defaultValue={min} placeholder="0" className="h-10" /></label>
                <label className="flex flex-1 flex-col gap-1 text-xs text-muted-foreground">Max<Input type="number" name="max" min={0} defaultValue={max} placeholder="Any" className="h-10" /></label>
              </div>
            </fieldset>
            {allBrands.length > 0 && (
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-slate-700">Brand</legend>
                {allBrands.map((b) => (
                  <label key={b} className="flex min-h-7 items-center gap-2.5 text-sm">
                    <input type="checkbox" name="brand" value={b} defaultChecked={brands.includes(b)} className="h-[18px] w-[18px] accent-primary" />
                    {b}
                  </label>
                ))}
              </fieldset>
            )}
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-slate-700">Availability</legend>
              <label className="flex min-h-7 items-center gap-2.5 text-sm"><input type="checkbox" name="instock" value="1" defaultChecked={inStock} className="h-[18px] w-[18px] accent-primary" />In stock</label>
              <label className="flex min-h-7 items-center gap-2.5 text-sm"><input type="checkbox" name="sale" value="1" defaultChecked={sale} className="h-[18px] w-[18px] accent-primary" />On sale</label>
            </fieldset>
            <Button type="submit" variant="navy">Apply filters</Button>
          </form>
        </FilterPanel>

        <section aria-label="Products" className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
            <p className="text-sm text-slate-700">
              Showing {result.products.length} of {result.total}
            </p>
            <SortSelect value={sort} />
          </div>
          {result.products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {result.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
              <p className="font-semibold">No products match your filters.</p>
              <Button asChild variant="outline"><Link href="/shop">Clear filters</Link></Button>
            </div>
          )}
          <Pagination page={result.page} pages={result.pages} basePath="/shop" params={sp} />
        </section>
      </div>
    </main>
  );
}
