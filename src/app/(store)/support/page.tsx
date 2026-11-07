import Link from 'next/link';
import type { Metadata } from 'next';
import { PackageSearch, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { ContactForm } from '@/components/store/contact-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getSettings } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = { title: 'Support' };

export default async function SupportPage() {
  const s = await getSettings();
  const faqs = [
    ['How long does delivery take?', `Standard delivery takes 3–5 business days. Express takes 1–2 days (${formatPrice(s.shippingRates.express)}), and same-day delivery is available in the city for orders placed before 2 PM (${formatPrice(s.shippingRates.sameday)}).`],
    ['Is shipping free?', `Yes — standard shipping is free on orders over ${formatPrice(s.freeShippingThreshold)}. Smaller orders ship for ${formatPrice(s.shippingRates.standard)}.`],
    ['How do I track my order?', 'Sign in and open My account — your latest order shows a live progress tracker. Guests can use the order link from their confirmation page.'],
    ['How do I return an item?', 'Contact us within 7 days of delivery using the form on this page with your order number. Items must be in their original condition and packaging.'],
    ['When will I get my refund?', 'Refunds are issued to your original payment method within 3–5 business days after we receive the return.'],
    ['Are your products genuine?', 'Every product is sourced from the brand or an authorised distributor, ships sealed and carries the full manufacturer warranty.'],
  ];
  const topics = [
    { icon: PackageSearch, title: 'Orders & tracking', text: 'Check status or change an order.', href: '/account' },
    { icon: Truck, title: 'Shipping & delivery', text: 'Delivery times, costs and coverage.', href: '#faq' },
    { icon: RotateCcw, title: 'Returns & refunds', text: 'Start a return and get refunded.', href: '#contact' },
    { icon: ShieldCheck, title: 'Warranty & repairs', text: 'Manufacturer warranty info.', href: '#faq' },
  ];

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container flex flex-col items-center gap-4 py-10 text-center sm:py-14">
          <h1 className="text-3xl font-semibold sm:text-4xl">How can we help?</h1>
          <p className="text-slate-300">Browse answers below or send us a message — we reply within 24 hours.</p>
        </div>
      </section>
      <main className="container flex flex-col gap-12 py-10 pb-16">
        <section aria-label="Help topics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(({ icon: Icon, title, text, href }) => (
            <Link key={title} href={href} className="flex flex-col gap-2 rounded-xl border p-5 transition hover:border-primary">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="h-5 w-5" /></span>
              <strong className="font-semibold">{title}</strong>
              <span className="text-sm text-muted-foreground">{text}</span>
            </Link>
          ))}
        </section>
        <div className="flex flex-wrap items-start gap-8">
          <section id="faq" className="flex min-w-0 flex-[999_1_480px] scroll-mt-6 flex-col gap-4">
            <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
            <Accordion type="single" collapsible defaultValue="q0" className="rounded-xl border">
              {faqs.map(([q, a], i) => (
                <AccordionItem key={q} value={`q${i}`} className="last:border-0">
                  <AccordionTrigger>{q}</AccordionTrigger>
                  <AccordionContent>{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
          <section id="contact" className="flex min-w-0 flex-[1_1_300px] scroll-mt-6 flex-col gap-4">
            <h2 className="text-2xl font-semibold">Contact us</h2>
            <ContactForm />
            <ul className="flex flex-col gap-2.5 text-sm">
              <li className="flex justify-between gap-3 rounded-lg bg-secondary px-4 py-3.5"><span>Email</span><strong className="min-w-0 break-all text-right font-semibold">{s.supportEmail}</strong></li>
              {s.supportPhone && <li className="flex justify-between gap-3 rounded-lg bg-secondary px-4 py-3.5"><span>Phone</span><strong className="font-semibold">{s.supportPhone}</strong></li>}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
