'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, Plus, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { saveProductAction } from '@/actions/products';
import { ProductArt } from '@/components/shared/product-art';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatPrice } from '@/lib/utils';
import type { CategoryDTO, ProductDTO, ProductImage } from '@/types';

const ART_KINDS = ['laptop', 'phone', 'headphones', 'watch', 'earbuds', 'tablet', 'gamepad', 'console', 'camera', 'mouse', 'speaker', 'keyboard', 'accessories'];

export function ProductForm({ product, categories }: { product?: ProductDTO | null; categories: CategoryDTO[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadedThisSession = useRef<Set<string>>(new Set());

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [shortDescription, setShort] = useState(product?.shortDescription ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [category, setCategory] = useState<string>(typeof product?.category === 'string' ? product.category : product?.category?._id ?? '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [compareAtPrice, setCompare] = useState(product?.compareAtPrice ? String(product.compareAtPrice) : '');
  const [cost, setCost] = useState(product?.cost != null ? String(product.cost) : '');
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [sku, setSku] = useState(product?.sku ?? '');
  const [status, setStatus] = useState<ProductDTO['status']>(product?.status ?? 'active');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [art, setArt] = useState(product?.art ?? 'accessories');
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [specs, setSpecs] = useState(product?.specs?.length ? product.specs : [{ key: '', value: '' }]);
  const [tags, setTags] = useState((product?.tags ?? []).join(', '));

  const p = parseFloat(price) || 0;
  const c = parseFloat(cost) || 0;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const body = new FormData();
      Array.from(files).forEach((f) => body.append('files', f));
      const res = await fetch('/api/upload', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      (json.images as ProductImage[]).forEach((i) => uploadedThisSession.current.add(i.publicId));
      setImages((prev) => [...prev, ...json.images]);
      toast.success(`${json.images.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeImage(img: ProductImage) {
    setImages((prev) => prev.filter((i) => i.publicId !== img.publicId || i.url !== img.url));
    // Images uploaded in this session (never saved) can be deleted right away; saved ones are cleaned up on save.
    if (img.publicId && uploadedThisSession.current.has(img.publicId)) {
      fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: img.publicId }) }).catch(() => {});
    }
  }

  function makeCover(index: number) {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveProductAction(product?._id ?? null, {
        name, slug, description, shortDescription, brand, category,
        price: p,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        cost: cost ? c : null,
        stock: parseInt(stock || '0', 10),
        sku, status, featured, badge, art, images,
        specs: specs.filter((s) => s.key.trim()),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      if (!res.ok) return void toast.error(res.error);
      toast.success(product ? 'Product saved' : 'Product created');
      uploadedThisSession.current.clear();
      if (!product) router.push(`/admin/products/${res.id}`);
      else router.refresh();
    });
  }

  const f = 'flex flex-col gap-1.5';
  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-semibold">{product ? name || 'Edit product' : 'New product'}</h1>
        <div className="flex flex-wrap gap-2.5">
          {product && <Button asChild variant="outline"><Link href={`/product/${product.slug}`} target="_blank">Preview</Link></Button>}
          <Button asChild variant="outline"><Link href="/admin/products">Cancel</Link></Button>
          <Button type="submit" disabled={pending || uploading}>{pending ? 'Saving…' : product ? 'Save product' : 'Create product'}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-5">
          <Card>
            <CardHeader><CardTitle>General</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              <div className={f}><Label htmlFor="p-name">Product name</Label><Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className={f}><Label htmlFor="p-short">Short description</Label><Input id="p-short" value={shortDescription} onChange={(e) => setShort(e.target.value)} maxLength={200} /></div>
              <div className={f}><Label htmlFor="p-desc">Description</Label><Textarea id="p-desc" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Media</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
                {images.map((img, i) => (
                  <div key={img.url} className={cn('group relative h-[130px] overflow-hidden rounded-xl border bg-secondary', i === 0 && 'ring-2 ring-primary')}>
                    <Image src={img.url} alt="" fill sizes="130px" className="object-contain p-2" />
                    {i === 0 && <span className="absolute bottom-2 left-2 rounded bg-navy px-1.5 py-0.5 text-[11px] font-semibold text-white">Cover</span>}
                    <div className="absolute right-1.5 top-1.5 flex gap-1">
                      {i > 0 && (
                        <button type="button" onClick={() => makeCover(i)} aria-label="Make cover image" className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"><Star className="h-4 w-4" /></button>
                      )}
                      <button type="button" onClick={() => removeImage(img)} aria-label="Remove image" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-destructive shadow"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex h-[130px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-[13px] text-slate-700 hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                  {uploading ? 'Uploading…' : 'Upload images'}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              <p className="text-xs text-muted-foreground">Images are stored on Cloudinary. PNG, JPG, WebP or AVIF up to 8 MB. The first image is the cover.</p>
              {images.length === 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg bg-secondary p-3">
                  <div className="w-16"><ProductArt kind={art} /></div>
                  <div className={cn(f, 'flex-1')}>
                    <Label htmlFor="p-art">Placeholder illustration (shown until you upload a photo)</Label>
                    <NativeSelect id="p-art" value={art} onChange={(e) => setArt(e.target.value)} className="h-10">
                      {ART_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </NativeSelect>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-3">
                <div className={f}><Label htmlFor="p-price">Price (৳)</Label><Input id="p-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
                <div className={f}><Label htmlFor="p-compare">Compare-at price (৳)</Label><Input id="p-compare" type="number" step="0.01" min="0" value={compareAtPrice} onChange={(e) => setCompare(e.target.value)} placeholder="Shows as a sale" /></div>
                <div className={f}><Label htmlFor="p-cost">Cost per item (৳)</Label><Input id="p-cost" type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
              </div>
              {cost && (
                <div className="flex flex-wrap gap-7 rounded-lg bg-slate-50 px-3.5 py-3 text-sm">
                  <span>Profit <strong>{formatPrice(p - c)}</strong></span>
                  <span>Margin <strong>{p ? Math.round(((p - c) / p) * 100) : 0}%</strong></span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input aria-label="Spec name" placeholder="e.g. Battery" value={s.key} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} className="flex-1" />
                  <Input aria-label="Spec value" placeholder="e.g. Up to 30 hours" value={s.value} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className="flex-[2]" />
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove spec" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}><Trash2 className="text-slate-500" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setSpecs([...specs, { key: '', value: '' }])}><Plus /> Add spec</Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              <NativeSelect aria-label="Product status" value={status} onChange={(e) => setStatus(e.target.value as ProductDTO['status'])}>
                <option value="active">Active — visible in store</option>
                <option value="draft">Draft — hidden</option>
                <option value="archived">Archived</option>
              </NativeSelect>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="p-featured" className="text-sm">Feature on homepage</Label>
                <Switch id="p-featured" checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className={f}><Label htmlFor="p-badge">Badge (optional)</Label><Input id="p-badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Best Seller, New" /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              <div className={f}><Label htmlFor="p-stock">Stock quantity</Label><Input id="p-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
              <div className={f}><Label htmlFor="p-sku">SKU</Label><Input id="p-sku" value={sku} onChange={(e) => setSku(e.target.value)} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3.5">
              <div className={f}>
                <Label htmlFor="p-cat">Category</Label>
                <NativeSelect id="p-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </NativeSelect>
              </div>
              <div className={f}><Label htmlFor="p-brand">Brand</Label><Input id="p-brand" value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
              <div className={f}><Label htmlFor="p-tags">Tags (comma separated)</Label><Input id="p-tags" value={tags} onChange={(e) => setTags(e.target.value)} /></div>
              <div className={f}><Label htmlFor="p-slug">URL slug</Label><Input id="p-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Generated from the name" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
