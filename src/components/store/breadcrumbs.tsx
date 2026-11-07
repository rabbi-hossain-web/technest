import Link from 'next/link';

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-[13px] text-muted-foreground">
      {items.map((it, i) => (
        <span key={i} className="flex gap-2">
          {i > 0 && <span aria-hidden="true">/</span>}
          {it.href ? (
            <Link href={it.href} className="text-primary hover:underline">{it.label}</Link>
          ) : (
            <span aria-current="page" className="text-foreground">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
