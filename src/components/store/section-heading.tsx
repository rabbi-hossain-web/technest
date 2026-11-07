import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function SectionHeading({ title, href, linkLabel = 'View All' }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="text-[22px] font-semibold sm:text-[26px]">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
