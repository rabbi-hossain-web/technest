import Link from 'next/link';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCustomers } from '@/lib/queries';
import { firstParam, formatDate, formatPrice, initials } from '@/lib/utils';

export const metadata = { title: 'Customers' };

function segment(c: { orders: number; spent: number; createdAt: string; lastOrder?: string | null }) {
  const days = (d: string) => (Date.now() - new Date(d).getTime()) / 86400000;
  if (c.spent >= 2000) return { label: 'VIP', variant: 'warning' as const };
  if (c.lastOrder && days(c.lastOrder) > 120) return { label: 'At risk', variant: 'danger' as const };
  if (days(c.createdAt) <= 30) return { label: 'New', variant: 'success' as const };
  if (c.orders > 1) return { label: 'Returning', variant: 'info' as const };
  return { label: c.orders ? 'Customer' : 'No orders', variant: 'secondary' as const };
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = firstParam((await searchParams).q) || '';
  const customers = await getCustomers(q);
  return (
    <>
      <PageHeader title="Customers" description={`${customers.length} customers${q ? ` matching “${q}”` : ''}`} />
      <Card className="overflow-hidden">
        <form className="border-b px-4 py-3.5"><Input name="q" defaultValue={q} placeholder="Search by name or email" aria-label="Search customers" className="h-10 max-w-sm" /></form>
        <Table className="min-w-[820px]">
          <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>City</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Total spent</TableHead><TableHead>Last order</TableHead><TableHead>Segment</TableHead></TableRow></TableHeader>
          <TableBody>
            {customers.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No customers yet.</TableCell></TableRow>}
            {customers.map((c) => {
              const seg = segment(c);
              return (
                <TableRow key={c._id}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <span aria-hidden="true" className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-accent-foreground">{initials(c.name)}</span>
                      <span className="flex flex-col"><span className="font-semibold">{c.name}</span><Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="text-xs text-muted-foreground hover:text-primary">{c.email}</Link></span>
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-700">{c.phone || '—'}</TableCell>
                  <TableCell className="text-slate-700">{c.city || '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.orders}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatPrice(c.spent)}</TableCell>
                  <TableCell className="text-slate-700">{c.lastOrder ? formatDate(c.lastOrder) : '—'}</TableCell>
                  <TableCell><Badge variant={seg.variant}>{seg.label}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
