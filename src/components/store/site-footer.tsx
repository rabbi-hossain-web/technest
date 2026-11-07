import Link from 'next/link';
import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { LogoMark } from '@/components/shared/logo';
import { DEFAULT_SETTINGS, getSettings } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';
import { NewsletterForm } from './newsletter-form';

export async function SiteFooter() {
  const settings = await getSettings().catch(() => DEFAULT_SETTINGS);
  const features = [
    { icon: Truck, title: 'Free Shipping', text: `On orders over ${formatPrice(settings.freeShippingThreshold, settings.currency).replace('.00', '')}` },
    { icon: ShieldCheck, title: 'Secure Payments', text: '100% safe & secure' },
    { icon: RotateCcw, title: 'Easy Returns', text: 'Hassle-free 7 days' },
    { icon: Headphones, title: '24/7 Support', text: "We're here to help" },
  ];
  const cols = [
    { title: 'Shop', links: [['All Products', '/shop'], ['Deals', '/deals'], ['Brands', '/brands'], ['New Arrivals', '/shop?sort=newest']] },
    { title: 'Help', links: [['Help Center', '/support'], ['Shipping', '/support#faq'], ['Returns', '/support#faq'], ['Track Order', '/account']] },
    { title: 'Company', links: [['About Us', '/support'], ['Privacy Policy', '/support'], ['Terms & Conditions', '/support'], ['Seller Admin', '/admin']] },
  ];

  return (
    <footer>
      <section aria-label="Why shop with us" className="border-t bg-white">
        <ul className="container grid grid-cols-1 gap-5 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center justify-center gap-3.5">
              <Icon className="h-7 w-7" strokeWidth={1.6} />
              <span className="flex flex-col">
                <strong className="text-sm font-semibold">{title}</strong>
                <span className="text-xs text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <div className="bg-navy text-slate-300">
        <div className="container flex flex-col gap-8 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-3.5 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 text-white">
                <LogoMark size={34} />
                <span className="flex flex-col">
                  <span className="font-display text-xl font-semibold">{settings.storeName}</span>
                  <span className="text-[11px] text-slate-300">{settings.tagline}</span>
                </span>
              </Link>
              <p className="max-w-sm text-sm leading-6">Get new arrivals and members-only deals in your inbox.</p>
              <NewsletterForm />
            </div>
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5 text-sm">
                <strong className="font-semibold text-white">{c.title}</strong>
                {c.links.map(([label, href]) => (
                  <Link key={label} href={href} className="hover:text-white">
                    {label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-[13px]">
            <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
            <p>{settings.supportEmail}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
