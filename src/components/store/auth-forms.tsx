'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, registerAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ''} />
      <div className="flex flex-col gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</Button>
      <p className="text-center text-sm text-muted-foreground">
        New to TechNest? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-primary">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ''} />
      <div className="flex flex-col gap-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" autoComplete="name" required /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <span className="text-xs text-muted-foreground">At least 8 characters.</span>
      </div>
      {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}</Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-primary">Sign in</Link>
      </p>
    </form>
  );
}
