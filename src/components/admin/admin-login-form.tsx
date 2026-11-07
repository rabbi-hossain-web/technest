'use client';

import { useActionState } from 'react';
import { adminLoginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5"><Label htmlFor="a-email">Work email</Label><Input id="a-email" name="email" type="email" autoComplete="username" required /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="a-pass">Password</Label><Input id="a-pass" name="password" type="password" autoComplete="current-password" required /></div>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</Button>
    </form>
  );
}
