import Link from 'next/link';
import type { Metadata } from 'next';
import { logoutAction } from '@/actions/auth';
import { PasswordForm, ProfileForm } from '@/components/store/account-forms';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { getOrdersForUser } from '@/lib/queries';
import { formatDate, formatPrice, initials } from '@/lib/utils';
import { User } from '@/models';

export const metadata: Metadata = { title: 'My account' };

export default async function AccountPage() {
  const session = await requireUser('/account');
  await connectDB();
  const [user, orders] = await Promise.all([User.findById(session.id).lean(), getOrdersForUser(session.id)]);
  const active = orders.find((o) => ['pending', 'processing', 'shipped'].includes(o.status));
  const spent = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const steps = ['pending', 'processing', 'shipped', 'delivered'];

  return (
    <main className="container flex flex-col gap-6 py-8 pb-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">{initials(session.name)}</span>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold sm:text-[28px]">Hello, {session.name.split(' ')[0]}</h1>
            <p className="text-sm text-muted-foreground">Member since {formatDate(user?.createdAt ?? new Date(), { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <form action={logoutAction}><Button variant="outline">Sign out</Button></form>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          ['Total orders', String(orders.length)],
          ['In progress', String(orders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status)).length)],
          ['Delivered', String(orders.filter((o) => o.status === 'delivered').length)],
          ['Total spent', formatPrice(spent)],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0 rounded-xl border p-4 sm:p-5"><p className="text-[13px] text-muted-foreground">{k}</p><p className="mt-1.5 break-words text-xl font-bold sm:text-[26px]">{v}</p></div>
        ))}
      </div>

      {active && (
        <section className="flex flex-col gap-5 rounded-xl border p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-sans text-lg font-semibold">Track order #{active.orderNumber}</h2>
              <p className="text-sm text-muted-foreground">Placed {formatDate(active.createdAt)}{active.trackingNumber ? ` · ${active.courier} ${active.trackingNumber}` : ''}</p>
            </div>
            <StatusBadge status={active.status} />
          </div>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-col gap-2">
                <span className={i <= steps.indexOf(active.status) ? 'h-1.5 rounded bg-primary' : 'h-1.5 rounded bg-slate-200'} />
                <span className="text-xs font-semibold capitalize sm:text-sm">{s}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Order history</TabsTrigger>
          <TabsTrigger value="profile">Profile &amp; address</TabsTrigger>
          <TabsTrigger value="security">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          {orders.length ? (
            <div className="overflow-hidden rounded-xl border">
              <Table className="min-w-[640px]">
                <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell className="font-semibold">#{o.orderNumber}</TableCell>
                      <TableCell>{formatDate(o.createdAt)}</TableCell>
                      <TableCell>{o.items.reduce((n, i) => n + i.qty, 0)} items</TableCell>
                      <TableCell className="font-semibold">{formatPrice(o.total)}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-right"><Link href={`/order/${o._id}`} className="font-medium text-primary hover:underline">Details</Link></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
              <p className="font-semibold">No orders yet</p>
              <Button asChild><Link href="/shop">Start shopping</Link></Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="profile">
          <div className="max-w-3xl rounded-xl border p-4 sm:p-6">
            <ProfileForm name={user?.name ?? session.name} email={session.email} phone={user?.phone ?? ''} address={(user?.address ?? {}) as Record<string, string>} />
          </div>
        </TabsContent>
        <TabsContent value="security">
          <div className="max-w-3xl rounded-xl border p-4 sm:p-6"><PasswordForm /></div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
