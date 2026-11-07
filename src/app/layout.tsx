import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

// Every page reads live data from MongoDB, so render on each request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'TechNest — Smarter Gadgets. Better Life.', template: '%s | TechNest' },
  description: 'Discover the newest gadgets, top brands and exclusive deals — all in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
