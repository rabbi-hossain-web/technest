import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Message, Order } from '@/models';

export const metadata = { title: { default: 'Admin', template: '%s · TechNest Admin' }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  await connectDB();
  const [pending, unread] = await Promise.all([Order.countDocuments({ status: 'pending' }), Message.countDocuments({ read: false })]);
  return (
    <div className="flex min-h-screen bg-secondary">
      <div className="hidden w-[260px] shrink-0 bg-navy lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <AdminSidebar badges={{ orders: pending, messages: unread }} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={session.name} pending={pending} badges={{ orders: pending, messages: unread }} />
        <main className="flex w-full max-w-[1400px] flex-col gap-6 p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
