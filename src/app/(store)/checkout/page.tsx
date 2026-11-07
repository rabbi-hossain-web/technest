import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/store/checkout-form';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { getSettings } from '@/lib/queries';
import { User } from '@/models';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([getSettings(), getSession()]);
  let defaults = { email: '', phone: '', address: {} as Record<string, string> };
  if (session) {
    await connectDB();
    const user = await User.findById(session.id).lean();
    const [first = '', ...rest] = (user?.name ?? session.name).split(' ');
    defaults = {
      email: session.email,
      phone: user?.phone ?? '',
      address: { firstName: user?.address?.firstName || first, lastName: user?.address?.lastName || rest.join(' '), address: user?.address?.address ?? '', city: user?.address?.city ?? '', postalCode: user?.address?.postalCode ?? '', country: user?.address?.country ?? '' },
    };
  }
  return (
    <main className="bg-secondary">
      <div className="container flex flex-col gap-6 py-8 pb-14">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <CheckoutForm settings={settings} defaults={defaults} signedIn={!!session} />
      </div>
    </main>
  );
}
