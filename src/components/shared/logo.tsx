import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={cn('shrink-0', className)}>
      <path d="M9 12h22l-2 22H11z" fill="none" stroke="#38B6FF" strokeWidth="3" strokeLinejoin="round" />
      <path d="M15 12V9a5 5 0 0 1 10 0v3" fill="none" stroke="#38B6FF" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 24c4 4 9 3 13-2" fill="none" stroke="#8FA8FF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = '/', tagline = true, name = 'TechNest', className }: { href?: string; tagline?: boolean | string; name?: string; className?: string }) {
  return (
    <Link href={href} aria-label={`${name} home`} className={cn('flex min-w-0 items-center gap-2 text-white sm:gap-3', className)}>
      <LogoMark className="h-8 w-8 sm:h-10 sm:w-10" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-display text-xl font-semibold leading-tight sm:text-2xl">{name}</span>
        {tagline && <span className="hidden text-xs text-slate-300 sm:block">{typeof tagline === 'string' ? tagline : 'Smarter Gadgets. Better Life.'}</span>}
      </span>
    </Link>
  );
}
