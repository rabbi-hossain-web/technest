import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { ProductDeleteButton } from '@/components/admin/product-row-actions';
import { Pagination } from '@/components/shared/pagination';
import { ProductImage } from '@/components/shared/product-image';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdminProducts, getCategories } from '@/lib/queries';
import { cn, firstParam, formatPrice } from '@/lib/utils';

export const metadata = { title: 'Products' };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = firstParam(sp.q) || '';
  const category = firstParam(sp.category) || '';
  const status = firstParam(sp.status) || 'all';
  const page = Number(firstParam(sp.page) || 1);
  const [{ products, total, pages }, categories] = await Promise.all([getAdminProducts({ q, category, status, page }), getCategories()]);

  return (
    <>
      <PageHeader title="Products" description={`${total} products`}>
        <Button asChild><Link href="/admin/products/new"><Plus /> Add product</Link></Button>
      </PageHeader>
      <Card className="overflow-hidden">
        <form className="flex flex-wrap items-center gap-2.5 border-b px-4 py-3.5">
          <Input name="q" defaultValue={q} placeholder="Search by name, SKU or brand" aria-label="Search products" className="h-10 max-w-xs" />
          <NativeSelect name="category" defaultValue={category} aria-label="Category" className="h-10 w-auto">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </NativeSelect>
          <NativeSelect name="status" defaultValue={status} aria-label="Status" className="h-10 w-auto">
            <option value="all">Any status</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
          </NativeSelect>
          <Button type="submit" variant="outline" size="sm" className="h-10">Filter</Button>
        </form>
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Sold</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No products found.</TableCell></TableRow>}
            {products.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  <Link href={`/admin/products/${p._id}`} className="flex items-center gap-3">
                    <span className="relative h-10 w-12 shrink-0 rounded-lg bg-secondary p-1"><ProductImage src={p.images?.[0]?.url} art={p.art} alt="" sizes="48px" /></span>
                    <span className="font-semibold hover:text-primary">{p.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-[13px] text-slate-700">{p.sku || '—'}</TableCell>
                <TableCell className="text-slate-700">{p.category?.name ?? '—'}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatPrice(p.price)}</TableCell>
                <TableCell className={cn('text-right tabular-nums', p.stock === 0 ? 'font-semibold text-red-700' : p.stock <= 5 ? 'font-semibold text-amber-700' : '')}>{p.stock === 0 ? 'Out' : p.stock}</TableCell>
                <TableCell className="text-right tabular-nums text-slate-700">{p.sold}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/products/${p._id}`} className="px-2 text-sm font-medium text-primary hover:underline">Edit</Link>
                    <ProductDeleteButton id={p._id} name={p.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="pb-4"><Pagination page={page} pages={pages} basePath="/admin/products" params={sp} /></div>
      </Card>
    </>
  );
}
