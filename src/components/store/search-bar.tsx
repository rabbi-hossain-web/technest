'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import { ProductImage } from '@/components/shared/product-image';
import { cn, formatPrice } from '@/lib/utils';

type Suggestion = {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  art: string;
};

export function SearchBar({ currency }: { currency: string }) {
  const router = useRouter();
  const listId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = q.trim();

  // Debounced fetch of matching products as the user types.
  useEffect(() => {
    if (term.length < 2) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { products: Suggestion[]; total: number };
        setResults(data.products);
        setTotal(data.total);
        setActive(-1);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [term]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const showPanel = open && term.length >= 2;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
      e.preventDefault();
      close();
      router.push(`/product/${results[active].slug}`);
    }
  };

  return (
    <form
      ref={formRef}
      action="/shop"
      role="search"
      onSubmit={close}
      className="relative order-last flex w-full max-w-2xl md:order-none md:w-auto md:flex-1"
    >
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-label="Search products"
        placeholder="Search for gadgets, brands and more…"
        className="h-[46px] min-w-0 flex-1 rounded-l-[10px] border-0 bg-white px-4 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-brand"
      />
      <button type="submit" aria-label="Search" className="flex h-[46px] w-14 items-center justify-center rounded-r-[10px] bg-primary hover:bg-primary/90">
        <Search className="h-5 w-5" />
      </button>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-white text-foreground shadow-xl">
          {loading && results.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">No products match “{term}”.</p>
          ) : (
            <>
              <ul id={listId} role="listbox" className="max-h-[420px] overflow-y-auto py-1">
                {results.map((p, i) => (
                  <li key={p._id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={close}
                      onMouseEnter={() => setActive(i)}
                      className={cn('flex items-center gap-3 px-4 py-2.5', i === active && 'bg-secondary')}
                    >
                      <div className="relative h-12 w-12 shrink-0 rounded-lg border bg-white p-1">
                        <ProductImage src={p.image} art={p.art} alt={p.name} sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        {p.brand && <p className="truncate text-xs text-slate-500">{p.brand}</p>}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-primary">{formatPrice(p.price, currency)}</p>
                        {p.compareAtPrice != null && p.compareAtPrice > p.price && (
                          <p className="text-xs text-slate-400 line-through">{formatPrice(p.compareAtPrice, currency)}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/shop?q=${encodeURIComponent(term)}`}
                onClick={close}
                className="flex items-center justify-between border-t bg-slate-50 px-4 py-3 text-sm font-medium text-primary hover:bg-slate-100"
              >
                <span>
                  See all {total} result{total === 1 ? '' : 's'} for “{term}”
                </span>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              </Link>
            </>
          )}
        </div>
      )}
    </form>
  );
}
