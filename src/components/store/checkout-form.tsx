'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { placeOrderAction, validateCouponAction } from '@/actions/orders';
import { ProductImage } from '@/components/shared/product-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';
import { useCartSync } from '@/hooks/use-cart-sync';
import { computeTotals } from '@/lib/pricing';
import { cn, formatPrice } from '@/lib/utils';
import type { AddressDTO, PaymentMethod, SettingsDTO, ShippingMethod } from '@/types';

type Defaults = { email: string; phone: string; address: Partial<AddressDTO> };

const PAYMENT_LABELS: Record<PaymentMethod, { label: string; note: string }> = {
  cod: { label: 'Cash on delivery', note: 'Pay in cash when your order arrives.' },
  bkash: { label: 'bKash', note: 'You’ll receive payment instructions by SMS/email after placing the order.' },
  card: { label: 'Credit / Debit card', note: 'Our team will send you a secure payment link to complete payment.' },
  paypal: { label: 'PayPal', note: 'We’ll email you a PayPal payment request.' },
};

export function CheckoutForm({ settings, defaults, signedIn }: { settings: SettingsDTO; defaults: Defaults; signedIn: boolean }) {
  const mounted = useMounted();
  useCartSync();
  const router = useRouter();
  const { items, coupon, clear } = useCart();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const enabledPayments = (Object.keys(PAYMENT_LABELS) as PaymentMethod[]).filter((m) => settings.paymentMethods[m]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(enabledPayments[0] ?? 'cod');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const money = (n: number) => formatPrice(n, settings.currency);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  useEffect(() => {
    if (!coupon) return setDiscount(0);
    validateCouponAction(coupon, subtotal).then((r) => setDiscount(r.ok ? r.discount : 0));
  }, [coupon, subtotal]);

  const totals = useMemo(() => computeTotals({ subtotal, discount, settings, method: shippingMethod }), [subtotal, discount, settings, shippingMethod]);

  if (!mounted) return <Skeleton className="h-[600px] w-full" />;
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-white p-14 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Button asChild><Link href="/shop">Browse products</Link></Button>
      </div>
    );
  }

  const ships: { id: ShippingMethod; label: string; eta: string; price: number }[] = [
    { id: 'standard', label: 'Standard delivery', eta: '3–5 business days', price: subtotal - discount >= settings.freeShippingThreshold ? 0 : settings.shippingRates.standard },
    { id: 'express', label: 'Express delivery', eta: '1–2 business days', price: settings.shippingRates.express },
    { id: 'sameday', label: 'Same-day delivery', eta: 'Order before 2 PM (city only)', price: settings.shippingRates.sameday },
  ];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? '').trim();
    start(async () => {
      const res = await placeOrderAction({
        items: items.map((i) => ({ productId: i.productId, slug: i.slug, qty: i.qty })),
        email: s('email'),
        phone: s('phone'),
        shippingAddress: { firstName: s('firstName'), lastName: s('lastName'), address: s('address'), city: s('city'), postalCode: s('postalCode'), country: s('country') },
        shippingMethod,
        paymentMethod,
        couponCode: coupon || undefined,
        notes: s('notes'),
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      clear();
      router.push(`/order/${res.orderId}?placed=1`);
    });
  };

  const field = 'flex flex-col gap-1.5';
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-7">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-sans text-lg font-semibold">1. Contact</h2>
            {!signedIn && <span className="text-[13px] text-muted-foreground">Have an account? <Link href="/login?next=/checkout" className="font-medium text-primary">Sign in</Link></span>}
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className={field}><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" defaultValue={defaults.email} required /></div>
            <div className={field}><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={defaults.phone} required /></div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="font-sans text-lg font-semibold">2. Shipping address</h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className={field}><Label htmlFor="firstName">First name</Label><Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={defaults.address.firstName} required /></div>
            <div className={field}><Label htmlFor="lastName">Last name</Label><Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={defaults.address.lastName} required /></div>
          </div>
          <div className={field}><Label htmlFor="address">Street address</Label><Input id="address" name="address" autoComplete="street-address" defaultValue={defaults.address.address} required /></div>
          <div className="grid gap-3.5 sm:grid-cols-3">
            <div className={field}><Label htmlFor="city">City</Label><Input id="city" name="city" autoComplete="address-level2" defaultValue={defaults.address.city} required /></div>
            <div className={field}><Label htmlFor="postalCode">Postal code</Label><Input id="postalCode" name="postalCode" autoComplete="postal-code" defaultValue={defaults.address.postalCode} required /></div>
            <div className={field}>
              <Label htmlFor="country">Country</Label>
              <NativeSelect id="country" name="country" defaultValue={defaults.address.country || 'Bangladesh'}>
                {['Bangladesh', 'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Other'].map((c) => <option key={c}>{c}</option>)}
              </NativeSelect>
            </div>
          </div>
          <div className={field}><Label htmlFor="notes">Delivery notes (optional)</Label><Textarea id="notes" name="notes" rows={2} /></div>
        </section>

        <section className="flex flex-col gap-3.5 rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="font-sans text-lg font-semibold">3. Delivery method</h2>
          <div role="radiogroup" aria-label="Delivery method" className="flex flex-col gap-2.5">
            {ships.map((s) => (
              <label key={s.id} className={cn('flex cursor-pointer items-center gap-3.5 rounded-xl border-2 px-4 py-3.5', shippingMethod === s.id ? 'border-primary bg-[#F0F6FF]' : 'border-border')}>
                <input type="radio" name="shippingMethod" value={s.id} checked={shippingMethod === s.id} onChange={() => setShippingMethod(s.id)} className="h-[18px] w-[18px] accent-primary" />
                <span className="flex flex-1 flex-col"><strong className="text-sm font-semibold">{s.label}</strong><span className="text-[13px] text-muted-foreground">{s.eta}</span></span>
                <span className="text-sm font-semibold">{s.price ? money(s.price) : 'Free'}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3.5 rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="font-sans text-lg font-semibold">4. Payment</h2>
          <div role="radiogroup" aria-label="Payment method" className="grid gap-2.5 sm:grid-cols-2">
            {enabledPayments.map((m) => (
              <label key={m} className={cn('flex h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-sm font-semibold', paymentMethod === m ? 'border-primary bg-[#F0F6FF]' : 'border-border')}>
                <input type="radio" name="paymentMethod" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="h-[18px] w-[18px] accent-primary" />
                {PAYMENT_LABELS[m].label}
              </label>
            ))}
          </div>
          <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-slate-700">{PAYMENT_LABELS[paymentMethod].note}</p>
        </section>
      </div>

      <aside aria-label="Order summary" className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 rounded-xl border bg-white p-4 sm:p-6">
        <h2 className="font-sans text-lg font-semibold">Order Summary</h2>
        <ul className="flex flex-col gap-3.5">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3">
              <span className="relative h-[52px] w-[60px] shrink-0 rounded-lg bg-secondary p-1.5">
                <ProductImage src={i.image} art={i.art} alt="" sizes="60px" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[11px] font-bold text-white">{i.qty}</span>
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium">{i.name}</span>
              <span className="text-sm font-semibold">{money(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2.5 border-t pt-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-slate-700">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between gap-3"><dt className="text-slate-700">Discount ({coupon})</dt><dd className="text-green-700">−{money(discount)}</dd></div>}
          <div className="flex justify-between gap-3"><dt className="text-slate-700">Shipping</dt><dd>{totals.shipping ? money(totals.shipping) : 'Free'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-700">Tax ({settings.taxRate}%)</dt><dd>{money(totals.tax)}</dd></div>
          <div className="flex justify-between border-t pt-3.5 text-lg"><dt className="font-semibold">Total</dt><dd className="font-bold">{money(totals.total)}</dd></div>
        </dl>
        <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-700">
          <input type="checkbox" required className="mt-0.5 h-[18px] w-[18px] accent-primary" />
          <span>I agree to the <Link href="/support" className="text-primary">Terms &amp; Conditions</Link> and return policy.</span>
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="h-[52px]" disabled={pending}>{pending ? 'Placing order…' : `Place Order · ${money(totals.total)}`}</Button>
        <Button asChild variant="link"><Link href="/cart">Back to cart</Link></Button>
      </aside>
    </form>
  );
}
