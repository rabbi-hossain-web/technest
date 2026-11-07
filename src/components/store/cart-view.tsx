'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Lock, Trash2, Truck } from 'lucide-react';
import { validateCouponAction } from '@/actions/orders';
import { ProductImage } from '@/components/shared/product-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';
import { useCartSync } from '@/hooks/use-cart-sync';
import { computeTotals } from '@/lib/pricing';
import { formatPrice } from '@/lib/utils';
import type { SettingsDTO } from '@/types';
import { QuantityStepper } from './product-purchase';

export function CartView({ settings }: { settings: SettingsDTO }) {
  const mounted = useMounted();
  useCartSync();
  const { items, setQty, remove, coupon, setCoupon } = useCart();
  const [code, setCode] = useState(coupon);
  const [discount, setDiscount] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const money = (n: number) => formatPrice(n, settings.currency);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  // Re-validate an applied coupon whenever the subtotal changes.
  useEffect(() => {
    if (!coupon) return setDiscount(0);
    let alive = true;
    validateCouponAction(coupon, subtotal).then((r) => {
      if (!alive) return;
      if (r.ok) {
        setDiscount(r.discount);
        setMsg({ ok: true, text: `${r.code} applied — ${r.label}.` });
      } else {
        setDiscount(0);
        setMsg({ ok: false, text: r.error });
      }
    });
    return () => {
      alive = false;
    };
  }, [coupon, subtotal]);

  if (!mounted) return <Skeleton className="h-96 w-full" />;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-14 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <p className="text-muted-foreground">Find something you love in the shop.</p>
        <Button asChild><Link href="/shop">Continue shopping</Link></Button>
      </div>
    );
  }

  const totals = computeTotals({ subtotal, discount, settings, method: 'standard' });
  const remaining = settings.freeShippingThreshold - (subtotal - discount);

  return (
    <div className="flex flex-wrap items-start gap-7">
      <section aria-label="Cart items" className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3.5 text-sm sm:px-5 text-accent-foreground">
          <Truck className="h-5 w-5 shrink-0" />
          {remaining > 0 ? <span>Add {money(remaining)} more for free shipping.</span> : <span>Your order qualifies for free shipping.</span>}
        </div>
        <ul className="flex flex-col rounded-xl border">
          {items.map((i) => (
            <li key={i.productId} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b p-4 last:border-0 sm:p-5">
              <Link href={`/product/${i.slug}`} aria-label={i.name} className="relative h-[72px] w-20 shrink-0 rounded-lg bg-secondary p-2 sm:h-[88px] sm:w-[104px] sm:p-2.5">
                <ProductImage src={i.image} art={i.art} alt={i.name} sizes="104px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-[180px]">
                <Link href={`/product/${i.slug}`} className="font-semibold hover:text-primary">{i.name}</Link>
                <span className="text-[13px] text-muted-foreground">{money(i.price)} each</span>
                {i.stock <= 5 && <span className="text-[13px] font-medium text-amber-700">Only {i.stock} left</span>}
              </div>
              <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-4">
                <QuantityStepper size="sm" value={i.qty} onChange={(n) => setQty(i.productId, n)} max={Math.max(1, Math.min(i.stock, 20))} label={`quantity of ${i.name}`} />
                <span className="ml-auto font-bold sm:ml-0 sm:w-24 sm:text-right">{money(i.price * i.qty)}</span>
                <Button variant="ghost" size="icon" aria-label={`Remove ${i.name}`} onClick={() => remove(i.productId)}>
                  <Trash2 className="text-slate-500" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button asChild variant="link" className="self-start px-0"><Link href="/shop"><ArrowLeft /> Continue shopping</Link></Button>
      </section>

      <aside aria-label="Order summary" className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 rounded-xl border p-4 sm:p-6">
        <h2 className="font-sans text-lg font-semibold">Order Summary</h2>
        <form
          className="flex flex-col gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await validateCouponAction(code, subtotal);
              if (r.ok) setCoupon(r.code);
              else {
                setCoupon('');
                setMsg({ ok: false, text: r.error });
              }
            });
          }}
        >
          <label htmlFor="coupon" className="text-[13px] font-medium text-slate-700">Coupon code</label>
          <div className="flex gap-2">
            <Input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. NEST10" />
            <Button type="submit" variant="outline" disabled={pending || !code}>{pending ? '…' : 'Apply'}</Button>
          </div>
          {msg && <span aria-live="polite" className={msg.ok ? 'text-[13px] text-green-700' : 'text-[13px] text-destructive'}>{msg.text}</span>}
          {coupon && (
            <button type="button" className="self-start text-[13px] text-primary hover:underline" onClick={() => { setCoupon(''); setCode(''); setMsg(null); }}>
              Remove coupon
            </button>
          )}
        </form>
        <dl className="flex flex-col gap-2.5 border-t pt-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-slate-700">Subtotal</dt><dd className="font-medium">{money(totals.subtotal)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-700">Discount</dt><dd className="font-medium text-green-700">{discount ? `−${money(discount)}` : '—'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-700">Shipping (standard)</dt><dd className="font-medium">{totals.shipping ? money(totals.shipping) : 'Free'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-700">Estimated tax ({settings.taxRate}%)</dt><dd className="font-medium">{money(totals.tax)}</dd></div>
          <div className="flex justify-between border-t pt-3.5 text-lg"><dt className="font-semibold">Total</dt><dd className="font-bold">{money(totals.total)}</dd></div>
        </dl>
        <Button asChild size="lg" className="h-[52px]"><Link href="/checkout">Proceed to Checkout <ArrowRight /></Link></Button>
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Secure checkout</p>
      </aside>
    </div>
  );
}
