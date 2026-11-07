import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { ProductImage } from '@/components/shared/product-image';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDashboardStats } from '@/lib/queries';
import { cn, formatDate, formatPrice } from '@/lib/utils';

export const metadata = { title: 'Dashboard' };

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={cn('text-[13px] font-semibold', up ? 'text-green-700' : 'text-red-700')}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(1)}% <span className="font-normal text-muted-foreground">vs last month</span>
    </span>
  );
}

export default async function DashboardPage() {
  const s = await getDashboardStats();
  const maxRev = Math.max(1, ...s.months.map((m) => m.revenue));
  const yearTotal = s.months.reduce((a, m) => a + m.revenue, 0);

  return (
    <>
      <PageHeader title="Dashboard" description="How the store is doing this month.">
        <Button asChild><Link href="/admin/products/new"><Plus /> Add product</Link></Button>
      </PageHeader>

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Revenue', value: formatPrice(s.revenue), delta: s.revenueDelta },
          { label: 'Orders', value: s.orders.toLocaleString(), delta: s.ordersDelta },
          { label: 'New customers', value: s.customers.toLocaleString(), delta: s.customersDelta },
          { label: 'Avg. order value', value: formatPrice(s.aov), delta: s.aovDelta },
        ].map((k) => (
          <Card key={k.label} className="flex flex-col gap-2 p-5">
            <span className="text-[13px] font-medium text-muted-foreground">{k.label}</span>
            <span className="text-[28px] font-bold tabular-nums">{k.value}</span>
            <Delta value={k.delta} />
          </Card>
        ))}
      </section>

      <div className="flex flex-wrap items-stretch gap-5">
        <Card className="min-w-0 flex-[2_1_320px]">
          <CardHeader className="flex-row flex-wrap items-baseline justify-between">
            <CardTitle>Revenue, last 12 months</CardTitle>
            <span className="text-[13px] text-muted-foreground">Total {formatPrice(yearTotal)}</span>
          </CardHeader>
          <CardContent>
            <div role="img" aria-label={`Monthly revenue bar chart. This month ${formatPrice(s.revenue)}.`} className="flex h-60 items-end gap-1 border-b sm:gap-2 border-slate-300 pb-0">
              {s.months.map((m, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="hidden text-[10px] font-semibold text-slate-600 sm:inline">{m.revenue ? `${Math.round(m.revenue / 1000)}k` : ''}</span>
                  <div
                    title={`${m.label}: ${formatPrice(m.revenue)}`}
                    className={cn('w-full max-w-[34px] rounded-t', i === s.months.length - 1 ? 'bg-primary' : 'bg-[#7DB0F2]')}
                    style={{ height: `${Math.max(1, (m.revenue / maxRev) * 88)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex gap-1 sm:gap-2">
              {s.months.map((m, i) => (
                <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground sm:text-[11px]">{m.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 flex-[1_1_300px]">
          <CardHeader><CardTitle>Sales by category</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {s.byCategory.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
            {s.byCategory.map((c) => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]"><span>{c.name}</span><span className="font-semibold">{c.share}%</span></div>
                <div className="h-2 overflow-hidden rounded bg-slate-100"><div className="h-full rounded bg-primary" style={{ width: `${c.share}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <Card className="min-w-0 flex-[2_1_320px] overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </CardHeader>
          <Table className="min-w-[560px]">
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {s.recent.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet.</TableCell></TableRow>}
              {s.recent.map((o) => (
                <TableRow key={o._id}>
                  <TableCell><Link href={`/admin/orders/${o._id}`} className="font-semibold text-primary hover:underline">#{o.orderNumber}</Link></TableCell>
                  <TableCell>{o.shippingAddress.firstName} {o.shippingAddress.lastName}</TableCell>
                  <TableCell className="font-semibold">{formatPrice(o.total)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatDate(o.createdAt, { month: 'short', day: 'numeric' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <Card>
            <CardHeader><CardTitle>Top products</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {s.top.map((p) => (
                <Link key={p._id} href={`/admin/products/${p._id}`} className="flex items-center gap-3">
                  <span className="relative h-10 w-12 shrink-0 rounded-lg bg-secondary p-1"><ProductImage src={p.images?.[0]?.url} art={p.art} alt="" sizes="48px" /></span>
                  <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-medium">{p.name}</span><span className="text-xs text-muted-foreground">{p.sold} sold</span></span>
                  <span className="text-sm font-semibold">{formatPrice(p.price * p.sold)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle>Low stock</CardTitle><Link href="/admin/products" className="text-[13px] text-primary hover:underline">Restock</Link></CardHeader>
            <CardContent className="flex flex-col">
              {s.lowStock.length === 0 && <p className="text-sm text-muted-foreground">All products are well stocked.</p>}
              {s.lowStock.map((p) => (
                <Link key={p._id} href={`/admin/products/${p._id}`} className="flex justify-between border-t py-2.5 text-sm first:border-0">
                  <span>{p.name}</span>
                  <span className={cn('font-semibold', p.stock === 0 ? 'text-red-700' : 'text-amber-700')}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
          {s.unreadMessages > 0 && (
            <Link href="/admin/messages" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              You have <strong>{s.unreadMessages}</strong> unread customer message{s.unreadMessages > 1 ? 's' : ''}.
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
