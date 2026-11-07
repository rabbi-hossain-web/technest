'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateOrderAction } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import type { OrderDTO, OrderStatus, PaymentStatus } from '@/types';

export function OrderUpdateForm({ order }: { order: OrderDTO }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [courier, setCourier] = useState(order.courier ?? '');
  const [trackingNumber, setTracking] = useState(order.trackingNumber ?? '');
  const [note, setNote] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateOrderAction(order._id, { status, paymentStatus, courier, trackingNumber, note });
          if (res.ok) {
            toast.success('Order updated');
            setNote('');
          } else toast.error(res.error);
        });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="o-status">Order status</Label>
        <NativeSelect id="o-status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s} className="capitalize">{s[0].toUpperCase() + s.slice(1)}</option>)}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="o-pay">Payment status</Label>
        <NativeSelect id="o-pay" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
          <option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="refunded">Refunded</option>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="o-courier">Courier</Label><Input id="o-courier" value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. Pathao, RedX, DHL" /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="o-track">Tracking number</Label><Input id="o-track" value={trackingNumber} onChange={(e) => setTracking(e.target.value)} /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="o-note">Add to timeline (optional)</Label><Textarea id="o-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note" /></div>
      {status === 'cancelled' && order.status !== 'cancelled' && <p className="text-[13px] text-amber-800">Cancelling returns the items to stock.</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Update order'}</Button>
    </form>
  );
}
