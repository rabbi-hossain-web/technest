'use client';

import { useActionState } from 'react';
import { changePasswordAction, updateProfileAction } from '@/actions/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddressDTO } from '@/types';

function Msg({ state }: { state?: { error?: string; success?: string } }) {
  if (state?.error) return <p role="alert" className="text-sm text-destructive">{state.error}</p>;
  if (state?.success) return <p role="status" className="text-sm text-green-700">{state.success}</p>;
  return null;
}

export function ProfileForm({ name, email, phone, address }: { name: string; email: string; phone: string; address: Partial<AddressDTO> }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);
  const f = 'flex flex-col gap-1.5';
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className={f}><Label htmlFor="p-name">Full name</Label><Input id="p-name" name="name" defaultValue={name} required /></div>
        <div className={f}><Label htmlFor="p-email">Email</Label><Input id="p-email" value={email} disabled readOnly /></div>
        <div className={f}><Label htmlFor="p-phone">Phone</Label><Input id="p-phone" name="phone" type="tel" defaultValue={phone} /></div>
      </div>
      <h3 className="mt-2 font-sans text-[15px] font-semibold">Default shipping address</h3>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className={f}><Label htmlFor="p-first">First name</Label><Input id="p-first" name="firstName" defaultValue={address.firstName} /></div>
        <div className={f}><Label htmlFor="p-last">Last name</Label><Input id="p-last" name="lastName" defaultValue={address.lastName} /></div>
      </div>
      <div className={f}><Label htmlFor="p-address">Street address</Label><Input id="p-address" name="address" defaultValue={address.address} /></div>
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className={f}><Label htmlFor="p-city">City</Label><Input id="p-city" name="city" defaultValue={address.city} /></div>
        <div className={f}><Label htmlFor="p-zip">Postal code</Label><Input id="p-zip" name="postalCode" defaultValue={address.postalCode} /></div>
        <div className={f}><Label htmlFor="p-country">Country</Label><Input id="p-country" name="country" defaultValue={address.country} /></div>
      </div>
      <Msg state={state} />
      <Button type="submit" disabled={pending} className="self-start">{pending ? 'Saving…' : 'Save profile'}</Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5"><Label htmlFor="pw-cur">Current password</Label><Input id="pw-cur" name="current" type="password" autoComplete="current-password" required /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="pw-new">New password</Label><Input id="pw-new" name="next" type="password" autoComplete="new-password" minLength={8} required /></div>
      <Msg state={state} />
      <Button type="submit" disabled={pending} className="self-start">{pending ? 'Updating…' : 'Update password'}</Button>
    </form>
  );
}
