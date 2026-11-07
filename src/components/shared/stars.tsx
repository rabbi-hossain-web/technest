import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} style={{ width: size, height: size }} className={i < full ? 'fill-star text-star' : 'fill-slate-200 text-slate-200'} />
      ))}
    </span>
  );
}
