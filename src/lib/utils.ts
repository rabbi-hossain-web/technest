import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, currency = 'BDT') {
  const isBDT = currency === 'BDT';
  // BDT: ৳ symbol, South Asian digit grouping (৳1,25,000), whole taka.
  return new Intl.NumberFormat(isBDT ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: isBDT ? 0 : 2,
    minimumFractionDigits: isBDT ? 0 : 2,
  }).format(value || 0);
}

export function formatDate(value: string | Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return new Date(value).toLocaleDateString('en-US', opts);
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Convert Mongoose documents (ObjectIds, Dates) into plain JSON-safe objects for client components. */
export function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function firstParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function listParam(v: string | string[] | undefined) {
  if (!v) return [];
  return (Array.isArray(v) ? v : v.split(',')).map((s) => s.trim()).filter(Boolean);
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
