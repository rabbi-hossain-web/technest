import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { ProductImage } from '@/components/shared/product-image';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';
import { getOrderById } from '@/lib/queries';
import { formatDate, formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Your order' };

const PAY: Record<string, string> = { cod: 'Cash on delivery', bkash: 'bKash', card: 'Card', paypal: 'PayPal' };
const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const [{ id }, { placed }, session] = await Promise.all([params, searchParams, getSession()]);
  const order = await getOrderById(id);
  if (!order) notFound();
  // Orders tied to an account are only visible to that account (or admins). Guest orders use their unguessable id.
  if (order.user && session?.role !== 'admin' && session?.id !== order.user) notFound();

  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const a = order.shippingAddress;

  return (
    <main className="mx-auto flex max-w-[880px] flex-col gap-7 px-4 py-8 sm:px-6 sm:py-12">
      <section className="flex flex-col items-center gap-3.5 text-center">
        {placed ? (
          <>
            <span aria-hidden="true" className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-100"><Check className="h-9 w-9 text-green-800" strokeWidth={2.4} /></span>
            <h1 className="text-2xl font-semibold sm:text-3xl">Thank you, {a.firstName}! Your order is confirmed.</h1>
            <p className="max-w-xl text-muted-foreground">We’ve saved your order and will email updates to {order.email}. Keep this page’s link to check its status any time.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold sm:text-3xl">Order #{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </>
        )}
      </section>

      {order.status !== 'cancelled' && (
        <ol aria-label="Order progress" className="grid grid-cols-4 gap-2 sm:gap-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-2">
              <span className={i <= stepIndex ? 'h-1.5 rounded bg-primary' : 'h-1.5 rounded bg-slate-200'} />
              <span className={i <= stepIndex ? 'break-words text-[11px] font-semibold capitalize sm:text-sm' : 'break-words text-[11px] capitalize text-muted-foreground sm:text-sm'}>{s}</span>
            </li>
          ))}
        </ol>
      )}

      <section aria-label="Order details" className="overflow-hidden rounded-xl border">
        <dl className="grid grid-cols-2 bg-secondary sm:grid-cols-4">
          {[
            ['Order number', `#${order.orderNumber}`],
            ['Date', formatDate(order.createdAt)],
            ['Payment', `${PAY[order.paymentMethod]} · ${order.paymentStatus}`],
            ['Status', order.status],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0 px-4 py-3.5 sm:px-5 sm:py-4">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="mt-1 break-words font-semibold capitalize">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="px-4 sm:px-5">
          {order.items.map((i) => (
            <li key={i.product} className="flex items-center gap-3.5 border-b py-3.5">
              <span className="relative h-[52px] w-[60px] shrink-0 sm:h-[60px] sm:w-[72px] rounded-lg bg-secondary p-2"><ProductImage src={i.image} art={i.art} alt="" sizes="72px" /></span>
              <span className="flex min-w-0 flex-1 flex-col">
                <Link href={`/product/${i.slug}`} className="font-medium hover:text-primary">{i.name}</Link>
                <span className="text-[13px] text-muted-foreground">Qty {i.qty} · {formatPrice(i.price)} each</span>
              </span>
              <span className="shrink-0 font-semibold">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 px-4 py-4 text-sm sm:px-5">
          <div className="flex justify-between gap-3"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between gap-3"><dt>Discount {order.couponCode && `(${order.couponCode})`}</dt><dd className="text-green-700">−{formatPrice(order.discount)}</dd></div>}
          <div className="flex justify-between gap-3"><dt>Shipping ({order.shippingMethod})</dt><dd>{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd></div>
          <div className="flex justify-between gap-3"><dt>Tax</dt><dd>{formatPrice(order.tax)}</dd></div>
          <div className="flex justify-between border-t pt-2 text-lg"><dt className="font-semibold">Total</dt><dd className="font-bold">{formatPrice(order.total)}</dd></div>
        </dl>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5">
          <h2 className="mb-2 font-sans text-[15px] font-semibold">Shipping to</h2>
          <p className="text-sm leading-6 text-slate-700">{a.firstName} {a.lastName}<br />{a.address}<br />{a.city} {a.postalCode}, {a.country}<br />{order.phone}</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="mb-2 font-sans text-[15px] font-semibold">Tracking</h2>
          {order.trackingNumber ? (
            <p className="text-sm text-slate-700">{order.courier || 'Courier'} · <strong>{order.trackingNumber}</strong></p>
          ) : (
            <p className="text-sm text-slate-700">We’ll add a tracking number as soon as your package ships.</p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        {session && <Button asChild variant="navy" size="lg"><Link href="/account">View my orders</Link></Button>}
        <Button asChild variant="outline" size="lg"><Link href="/shop">Continue shopping</Link></Button>
      </div>
    </main>
  );
}
