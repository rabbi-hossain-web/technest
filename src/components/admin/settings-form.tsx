'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { saveSettingsAction } from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import type { SettingsDTO } from '@/types';

function toLocalInput(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SettingsForm({ settings }: { settings: SettingsDTO }) {
  const [s, setS] = useState({ ...settings, dealsEndAt: toLocalInput(settings.dealsEndAt) });
  const [pending, start] = useTransition();
  const f = 'flex flex-col gap-1.5';
  const payments: { key: keyof SettingsDTO['paymentMethods']; label: string; note: string }[] = [
    { key: 'cod', label: 'Cash on delivery', note: 'Customer pays the courier.' },
    { key: 'bkash', label: 'bKash', note: 'Manual confirmation; mark orders paid in the order screen.' },
    { key: 'card', label: 'Credit / debit card', note: 'Needs a payment gateway (e.g. Stripe, SSLCommerz) — see README.' },
    { key: 'paypal', label: 'PayPal', note: 'Needs PayPal integration — see README.' },
  ];

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveSettingsAction({ ...s, dealsEndAt: s.dealsEndAt ? new Date(s.dealsEndAt).toISOString() : '' });
          if (res.ok) toast.success('Settings saved');
          else toast.error(res.error);
        });
      }}
    >
      <div className="flex justify-end"><Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</Button></div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Store details</CardTitle></CardHeader>
          <CardContent className="grid gap-3.5 sm:grid-cols-2">
            <div className={f}><Label htmlFor="s-name">Store name</Label><Input id="s-name" value={s.storeName} onChange={(e) => setS({ ...s, storeName: e.target.value })} required /></div>
            <div className={f}><Label htmlFor="s-tag">Tagline</Label><Input id="s-tag" value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></div>
            <div className={f}><Label htmlFor="s-email">Support email</Label><Input id="s-email" type="email" value={s.supportEmail} onChange={(e) => setS({ ...s, supportEmail: e.target.value })} required /></div>
            <div className={f}><Label htmlFor="s-phone">Support phone</Label><Input id="s-phone" value={s.supportPhone} onChange={(e) => setS({ ...s, supportPhone: e.target.value })} /></div>
            <div className={f}>
              <Label htmlFor="s-cur">Currency</Label>
              <NativeSelect id="s-cur" value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value })}>
                <option value="BDT">BDT (৳)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option>
              </NativeSelect>
            </div>
            <div className={f}><Label htmlFor="s-deals">Deals countdown ends</Label><Input id="s-deals" type="datetime-local" value={s.dealsEndAt} onChange={(e) => setS({ ...s, dealsEndAt: e.target.value })} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Shipping &amp; tax</CardTitle></CardHeader>
          <CardContent className="grid gap-3.5 sm:grid-cols-2">
            <div className={f}><Label htmlFor="s-free">Free shipping over (৳)</Label><Input id="s-free" type="number" min="0" step="0.01" value={s.freeShippingThreshold} onChange={(e) => setS({ ...s, freeShippingThreshold: Number(e.target.value) })} /></div>
            <div className={f}><Label htmlFor="s-tax">Tax rate (%)</Label><Input id="s-tax" type="number" min="0" max="100" step="0.01" value={s.taxRate} onChange={(e) => setS({ ...s, taxRate: Number(e.target.value) })} /></div>
            <div className={f}><Label htmlFor="s-std">Standard rate (৳)</Label><Input id="s-std" type="number" min="0" step="0.01" value={s.shippingRates.standard} onChange={(e) => setS({ ...s, shippingRates: { ...s.shippingRates, standard: Number(e.target.value) } })} /></div>
            <div className={f}><Label htmlFor="s-exp">Express rate (৳)</Label><Input id="s-exp" type="number" min="0" step="0.01" value={s.shippingRates.express} onChange={(e) => setS({ ...s, shippingRates: { ...s.shippingRates, express: Number(e.target.value) } })} /></div>
            <div className={f}><Label htmlFor="s-same">Same-day rate (৳)</Label><Input id="s-same" type="number" min="0" step="0.01" value={s.shippingRates.sameday} onChange={(e) => setS({ ...s, shippingRates: { ...s.shippingRates, sameday: Number(e.target.value) } })} /></div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Payment methods at checkout</CardTitle></CardHeader>
          <CardContent className="flex flex-col">
            {payments.map((p) => (
              <div key={p.key} className="flex items-center justify-between gap-4 border-t py-3.5 first:border-0">
                <span className="flex flex-col"><strong className="text-sm font-semibold">{p.label}</strong><span className="text-xs text-muted-foreground">{p.note}</span></span>
                <Switch
                  aria-label={`${p.label} enabled`}
                  checked={s.paymentMethods[p.key]}
                  onCheckedChange={(v) => setS({ ...s, paymentMethods: { ...s.paymentMethods, [p.key]: v } })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
