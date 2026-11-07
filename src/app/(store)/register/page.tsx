import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/store/auth-shell';
import { RegisterForm } from '@/components/store/auth-forms';
import { getSession } from '@/lib/auth';

export const metadata: Metadata = { title: 'Create account' };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getSession()) redirect(next || '/account');
  return (
    <AuthShell title="Create your account">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
