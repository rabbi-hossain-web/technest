'use client';

import { useActionState } from 'react';
import { sendMessageAction } from '@/actions/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessageAction, undefined);
  if (state?.success) {
    return <p role="status" className="rounded-xl border bg-green-50 p-6 text-green-800">{state.success}</p>;
  }
  return (
    <form action={action} className="flex flex-col gap-3.5 rounded-xl border p-4 sm:p-6">
      <div className="flex flex-col gap-1.5"><Label htmlFor="c-name">Name</Label><Input id="c-name" name="name" autoComplete="name" required /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="c-email">Email</Label><Input id="c-email" name="email" type="email" autoComplete="email" required /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="c-order">Order number (optional)</Label><Input id="c-order" name="orderNumber" placeholder="TN-00000" /></div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="c-topic">Topic</Label>
        <NativeSelect id="c-topic" name="topic">
          {['Order status', 'Returns & refunds', 'Product question', 'Payment', 'Other'].map((t) => <option key={t}>{t}</option>)}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="c-msg">Message</Label><Textarea id="c-msg" name="message" rows={4} required /></div>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</Button>
    </form>
  );
}
