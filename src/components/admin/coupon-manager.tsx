'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createCouponAction, deleteCouponAction, toggleCouponAction } from '@/actions/coupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatPrice } from '@/lib/utils';
import type { CouponDTO } from '@/types';
import { DeleteButton } from './delete-button';

const EMPTY = { code: '', description: '', type: 'percent' as 'percent' | 'fixed', value: '10', minOrder: '0', usageLimit: '', expiresAt: '' };

export function CouponManager({ coupons }: { coupons: CouponDTO[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex flex-wrap items-start gap-5">
      <Card className="min-w-0 flex-[2_1_320px] overflow-hidden">
        <Table className="min-w-[640px]">
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Used</TableHead><TableHead>Expires</TableHead><TableHead>Active</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
          <TableBody>
            {coupons.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No coupons yet.</TableCell></TableRow>}
            {coupons.map((c) => {
              const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
              return (
                <TableRow key={c._id}>
                  <TableCell>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold tracking-wide">{c.code}</span>
                      <span className="text-xs text-muted-foreground">{c.description || (c.minOrder ? `Min. order ${formatPrice(c.minOrder)}` : 'No minimum')}</span>
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)}</TableCell>
                  <TableCell className="text-slate-700">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</TableCell>
                  <TableCell className={expired ? 'text-red-700' : 'text-slate-700'}>{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={c.active}
                      aria-label={`${c.code} active`}
                      onCheckedChange={(v) => start(async () => { await toggleCouponAction(c._id, v); router.refresh(); })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteButton iconOnly label={`Delete ${c.code}`} confirmText={`Delete coupon ${c.code}?`} onDelete={() => deleteCouponAction(c._id)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <Card className="min-w-0 flex-[1_1_300px]">
        <CardHeader><CardTitle>Create coupon</CardTitle></CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await createCouponAction({
                  code: form.code, description: form.description, type: form.type,
                  value: Number(form.value), minOrder: Number(form.minOrder || 0),
                  usageLimit: form.usageLimit ? Number(form.usageLimit) : null, expiresAt: form.expiresAt,
                });
                if (!res.ok) return void toast.error(res.error);
                toast.success(`${form.code.toUpperCase()} created`);
                setForm(EMPTY);
                router.refresh();
              });
            }}
          >
            <div className="flex flex-col gap-1.5"><Label htmlFor="cp-code">Code</Label><Input id="cp-code" value={form.code} onChange={set('code')} placeholder="WINTER20" className="uppercase" required /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="cp-desc">Description (optional)</Label><Input id="cp-desc" value={form.description} onChange={set('description')} placeholder="Shown on the Deals page" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><Label htmlFor="cp-type">Type</Label><NativeSelect id="cp-type" value={form.type} onChange={set('type')}><option value="percent">Percentage</option><option value="fixed">Fixed amount</option></NativeSelect></div>
              <div className="flex flex-col gap-1.5"><Label htmlFor="cp-value">Value (% or ৳)</Label><Input id="cp-value" type="number" min="0" step="0.01" value={form.value} onChange={set('value')} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><Label htmlFor="cp-min">Min. order (৳)</Label><Input id="cp-min" type="number" min="0" value={form.minOrder} onChange={set('minOrder')} /></div>
              <div className="flex flex-col gap-1.5"><Label htmlFor="cp-limit">Usage limit</Label><Input id="cp-limit" type="number" min="1" value={form.usageLimit} onChange={set('usageLimit')} placeholder="Unlimited" /></div>
            </div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="cp-exp">Expires on</Label><Input id="cp-exp" type="date" value={form.expiresAt} onChange={set('expiresAt')} /></div>
            <Button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create coupon'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
