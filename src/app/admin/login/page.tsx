import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { LogoMark } from '@/components/shared/logo';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Admin sign in', robots: { index: false } };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === 'admin') redirect('/admin');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1C3563 0%, #0B1730 60%)' }}>
      <Link href="/" className="flex items-center gap-3 text-white">
        <LogoMark size={42} />
        <span className="font-display text-[26px] font-semibold">TechNest</span>
        <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">Admin</span>
      </Link>
      <section className="flex w-full max-w-[420px] flex-col gap-5 rounded-2xl bg-white p-6 sm:p-9">
        <div>
          <h1 className="text-2xl font-semibold">Sign in to the dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Staff accounts only.</p>
        </div>
        <AdminLoginForm />
      </section>
      <Link href="/" className="text-sm text-slate-300 hover:text-white">← Back to store</Link>
    </main>
  );
}
