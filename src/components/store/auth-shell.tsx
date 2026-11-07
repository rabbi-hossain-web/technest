import { Check } from 'lucide-react';
import { ProductArt } from '@/components/shared/product-art';

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="bg-secondary">
      <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap overflow-hidden rounded-2xl border bg-white">
          <section aria-label="Member benefits" className="order-last flex flex-[1_1_340px] flex-col gap-5 bg-navy p-6 text-white sm:p-10 md:order-none">
            <p className="font-display text-2xl font-semibold leading-tight sm:text-3xl">Welcome to <span className="text-sky-brand">TechNest</span></p>
            <p className="text-[15px] leading-relaxed text-slate-300">One account for faster checkout, order tracking and member-only prices.</p>
            <ul className="flex flex-col gap-3.5 text-[15px]">
              {['Track orders and returns in one place', 'Save addresses for one-click checkout', 'Early access to flash sales'].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-brand/20 text-sky-brand"><Check className="h-4 w-4" /></span>{t}</li>
              ))}
            </ul>
            <div aria-hidden="true" className="mt-auto flex items-end gap-3 pt-4">
              <div className="w-[40%]"><ProductArt kind="laptop" /></div>
              <div className="w-[26%]"><ProductArt kind="headphones" /></div>
              <div className="w-[22%]"><ProductArt kind="watch" /></div>
            </div>
          </section>
          <section className="flex min-w-0 flex-[1_1_400px] flex-col gap-6 p-6 sm:p-10">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
