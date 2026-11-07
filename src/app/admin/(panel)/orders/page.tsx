import Link from 'next/link';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdminOrders } from '@/lib/queries';
import { cn, firstParam, formatDate, formatPrice } from '@/lib/utils';

export const metadata = { title: 'Orders' };

const TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAY: Record<string, string> = { cod: 'Cash on delivery', bkash: 'bKash', card: 'Card', paypal: 'PayPal' };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const status = firstParam(sp.status) || 'all';
  const q = firstParam(sp.q) || '';
  const page = Number(firstParam(sp.page) || 1);
  const { orders, total, pages, byStatus } = await getAdminOrders({ status, q, page });

  return (
    <>
      <PageHeader title="Orders" description={`${total} ${status === 'all' ? '' : status} orders${q ? ` matching “${q}”` : ''}`} />
      <Card className="overflow-hidden">
        <nav aria-label="Filter by status" className="flex gap-1 overflow-x-auto border-b px-4">
          {TABS.map((t) => (
            <Link
              key={t}
              href={`/admin/orders?status=${t}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              aria-current={status === t ? 'page' : undefined}
              className={cn('-mb-px flex h-[50px] items-center gap-2 whitespace-nowrap border-b-2 px-3.5 text-sm font-semibold capitalize', status === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}
            >
              {t}
              <span className="rounded-full bg-slate-100 px-2 text-xs text-slate-700">{byStatus[t] ?? 0}</span>
            </Link>
          ))}
        </nav>
        <form className="flex flex-wrap gap-2.5 px-4 py-3.5">
          <input type="hidden" name="status" value={status} />
          <Input name="q" defaultValue={q} placeholder="Search by order #, name or email" aria-label="Search orders" className="h-10 max-w-sm" />
        </form>
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No orders found.</TableCell></TableRow>}
            {orders.map((o) => (
              <TableRow key={o._id}>
                <TableCell><Link href={`/admin/orders/${o._id}`} className="font-semibold text-primary hover:underline">#{o.orderNumber}</Link></TableCell>
                <TableCell className="text-slate-700">{formatDate(o.createdAt)}</TableCell>
                <TableCell><span className="flex flex-col"><span className="font-medium">{o.shippingAddress.firstName} {o.shippingAddress.lastName}</span><span className="text-xs text-muted-foreground">{o.email}</span></span></TableCell>
                <TableCell className="text-slate-700">{o.items.reduce((n, i) => n + i.qty, 0)}</TableCell>
                <TableCell><span className="flex flex-col text-slate-700">{PAY[o.paymentMethod]}<StatusBadge status={o.paymentStatus} className="mt-1 self-start" /></span></TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatPrice(o.total)}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="text-right"><Link href={`/admin/orders/${o._id}`} className="font-medium text-primary hover:underline">View</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="pb-4"><Pagination page={page} pages={pages} basePath="/admin/orders" params={sp} /></div>
      </Card>
    </>
  );
}
