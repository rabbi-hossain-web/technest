import { SiteHeader } from '@/components/store/site-header';
import { SiteFooter } from '@/components/store/site-footer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
