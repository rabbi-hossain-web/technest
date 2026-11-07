import type { Metadata } from 'next';
import { Countdown } from '@/components/store/countdown';
import { CopyCode } from '@/components/store/copy-code';
import { ProductCard } from '@/components/store/product-card';
import { connectDB } from '@/lib/db';
import { getDeals, getSettings } from '@/lib/queries';
import { Coupon } from '@/models';

export const metadata: Metadata = { title: 'Deals' };

function endOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  d.setHours(23, 59, 59, 0);
  return d;
}

export default async function DealsPage() {
  const [deals, settings] = await Promise.all([getDeals(), getSettings()]);
  await connectDB();
  const coupon = await Coupon.findOne({ active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }).sort({ createdAt: 1 }).lean();
  const endsAt = settings.dealsEndAt && new Date(settings.dealsEndAt) > new Date() ? new Date(settings.dealsEndAt) : endOfWeek();
  const maxOff = deals.reduce((m, p) => Math.max(m, p.compareAtPrice ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0), 0);

  return (
    <main className="container flex flex-col gap-10 py-6 pb-14">
      <section
        aria-label="Flash sale"
        className="flex flex-wrap items-center gap-8 rounded-2xl px-5 py-9 text-white sm:px-12 sm:py-11"
        style={{ background: 'radial-gradient(ellipse at 80% 30%, #1C3563 0%, #0B1730 60%)' }}
      >
        <div className="flex flex-[1_1_300px] flex-col gap-3.5">
          <span className="self-start rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-950">Flash sale</span>
          <h1 className="text-4xl font-bold leading-tight sm:text-[44px]">
            This Week&apos;s Deals
            {maxOff > 0 && (<><br /><span className="text-sky-brand">Up to {maxOff}% off</span></>)}
          </h1>
          <p className="max-w-md text-slate-300">Limited stock on laptops, audio and wearables. Prices return to normal when the timer runs out.</p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-slate-300">Ends in</span>
          <Countdown endsAt={endsAt.toISOString()} />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-[22px] font-semibold sm:text-[26px]">Today&apos;s Deals</h2>
        {deals.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No deals right now. Set a “compare-at price” on products in the admin panel to feature them here.</p>
        )}
      </section>

      {coupon && (
        <section aria-label="Coupon" className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#E6F0FD] px-5 py-6 sm:px-8 sm:py-7">
          <div>
            <h2 className="text-[22px] font-semibold">{coupon.type === 'percent' ? `Extra ${coupon.value}% off` : `$${coupon.value} off`} {coupon.description ? `— ${coupon.description}` : ''}</h2>
            <p className="mt-1.5 text-[15px] text-slate-800">Use the code at checkout{coupon.minOrder ? `. Valid on orders over $${coupon.minOrder}` : ''}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl border-2 border-dashed border-primary bg-white px-4 py-2 font-display text-lg sm:px-5 sm:py-2.5 sm:text-xl font-semibold tracking-[0.12em] text-[#0F3E8A]">{coupon.code}</span>
            <CopyCode code={coupon.code} />
          </div>
        </section>
      )}
    </main>
  );
}
