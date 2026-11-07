import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/store/auth-shell';
import { LoginForm } from '@/components/store/auth-forms';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getSession()) redirect(next || '/account');
  return (
    <AuthShell title="Sign in to your account">
      <LoginForm next={next} />
    </AuthShell>
  );
}
