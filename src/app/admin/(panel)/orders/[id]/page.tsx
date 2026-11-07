import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { OrderUpdateForm } from '@/components/admin/order-update-form';
import { ProductImage } from '@/components/shared/product-image';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrderById } from '@/lib/queries';
import { formatDateTime, formatPrice } from '@/lib/utils';

const PAY: Record<string, string> = { cod: 'Cash on delivery', bkash: 'bKash', card: 'Card', paypal: 'PayPal' };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const a = order.shippingAddress;

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" /> All orders</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold sm:text-[26px]">Order #{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus} />
      </div>
      <p className="-mt-4 text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-5">
          <Card className="overflow-hidden">
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <ul className="px-5">
              {order.items.map((i) => (
                <li key={i.product} className="flex items-center gap-3.5 border-t py-3.5">
                  <span className="relative h-[50px] w-[60px] shrink-0 rounded-lg bg-secondary p-1.5"><ProductImage src={i.image} art={i.art} alt="" sizes="60px" /></span>
                  <span className="flex min-w-0 flex-1 flex-col"><Link href={`/admin/products/${i.product}`} className="text-sm font-semibold hover:text-primary">{i.name}</Link><span className="text-xs text-slate-700 sm:hidden">{formatPrice(i.price)} × {i.qty}</span></span>
                  <span className="hidden text-sm text-slate-700 sm:inline">{formatPrice(i.price)} × {i.qty}</span>
                  <span className="shrink-0 text-right font-semibold sm:w-24">{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-2 bg-slate-50 px-5 py-4 text-sm">
              <div className="flex justify-between gap-3"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between gap-3"><dt>Discount ({order.couponCode})</dt><dd className="text-green-700">−{formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between gap-3"><dt>Shipping ({order.shippingMethod})</dt><dd>{formatPrice(order.shipping)}</dd></div>
              <div className="flex justify-between gap-3"><dt>Tax</dt><dd>{formatPrice(order.tax)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-base"><dt className="font-semibold">Total</dt><dd className="font-bold">{formatPrice(order.total)}</dd></div>
            </dl>
          </Card>
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="flex flex-col">
                {[...order.timeline].reverse().map((t, i) => (
                  <li key={i} className="flex gap-3.5">
                    <span className="flex flex-col items-center"><span className="mt-1 h-3 w-3 rounded-full bg-primary" /><span className="min-h-7 w-0.5 flex-1 bg-border" /></span>
                    <span className="flex flex-col gap-0.5 pb-3.5"><strong className="text-sm font-semibold">{t.note}</strong><span className="text-xs text-muted-foreground">{formatDateTime(t.at)}</span></span>
                  </li>
                ))}
              </ol>
              {order.notes && <p className="mt-2 rounded-lg bg-secondary p-3 text-sm"><strong>Customer note:</strong> {order.notes}</p>}
            </CardContent>
          </Card>
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <Card>
            <CardHeader><CardTitle>Fulfilment</CardTitle></CardHeader>
            <CardContent><OrderUpdateForm order={order} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="text-sm leading-6 text-slate-700">
              <p className="font-semibold text-foreground">{a.firstName} {a.lastName}</p>
              <p>{order.email}<br />{order.phone}</p>
              <p className="mt-1 text-xs text-muted-foreground">{order.user ? 'Registered customer' : 'Guest checkout'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Shipping address</CardTitle></CardHeader>
            <CardContent className="text-sm leading-6 text-slate-700">{a.address}<br />{a.city} {a.postalCode}<br />{a.country}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-700">{PAY[order.paymentMethod]} · <span className="capitalize">{order.paymentStatus}</span></CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
