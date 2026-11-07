import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = { page: number; pages: number; basePath: string; params: Record<string, string | string[] | undefined> };

function hrefFor(basePath: string, params: Props['params'], page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === 'page' || v == null) continue;
    (Array.isArray(v) ? v : [v]).forEach((x) => sp.append(k, x));
  }
  if (page > 1) sp.set('page', String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, pages, basePath, params }: Props) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const box = 'flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm';
  return (
    <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-1.5 pt-3">
      {page > 1 && (
        <Link href={hrefFor(basePath, params, page - 1)} className={box} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="flex h-11 items-center px-1 text-muted-foreground">…</span>}
          <Link
            href={hrefFor(basePath, params, n)}
            aria-current={n === page ? 'page' : undefined}
            className={cn(box, n === page && 'border-navy bg-navy font-semibold text-white')}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={hrefFor(basePath, params, page + 1)} className={box} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Link>
      )}
    </nav>
  );
}
