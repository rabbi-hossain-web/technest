'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { assertAdmin } from '@/lib/auth';
import { deleteImage, isCloudinaryConfigured } from '@/lib/cloudinary';
import { getProductsByIds } from '@/lib/queries';
import { slugify } from '@/lib/utils';
import { Category, Product } from '@/models';

const productSchema = z.object({
  name: z.string().min(2, 'Enter a product name'),
  slug: z.string().optional().default(''),
  description: z.string().optional().default(''),
  shortDescription: z.string().optional().default(''),
  brand: z.string().optional().default(''),
  category: z.string().optional().default(''),
  price: z.coerce.number().min(0, 'Price must be positive'),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  cost: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional().default(''),
  status: z.enum(['active', 'draft', 'archived']),
  featured: z.boolean().default(false),
  badge: z.string().optional().default(''),
  art: z.string().optional().default('accessories'),
  images: z.array(z.object({ url: z.string().refine((u) => u.startsWith('/') || z.string().url().safeParse(u).success, 'Invalid image URL'), publicId: z.string().default('') })).default([]),
  specs: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  tags: z.array(z.string()).default([]),
});

export type ProductInput = z.input<typeof productSchema>;

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || 'product';
  let i = 2;
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function saveProductAction(id: string | null, input: ProductInput) {
  await assertAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const d = parsed.data;

  await connectDB();
  const data = {
    ...d,
    slug: await uniqueSlug(d.slug || d.name, id ?? undefined),
    category: d.category || null,
    compareAtPrice: d.compareAtPrice || null,
    cost: d.cost ?? null,
    specs: d.specs.filter((s) => s.key.trim() && s.value.trim()),
    tags: d.tags.map((t) => t.trim()).filter(Boolean),
  };

  let saved;
  if (id) {
    const before = await Product.findById(id).lean();
    if (!before) return { ok: false as const, error: 'Product not found.' };
    saved = await Product.findByIdAndUpdate(id, data, { new: true });
    // Clean up images removed in the editor.
    const keep = new Set(d.images.map((i) => i.publicId));
    if (isCloudinaryConfigured()) {
      for (const img of before.images ?? []) if (img.publicId && !keep.has(img.publicId)) await deleteImage(img.publicId).catch(() => {});
    }
  } else {
    saved = await Product.create(data);
  }

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  revalidatePath('/');
  return { ok: true as const, id: String(saved!._id), slug: saved!.slug };
}

export async function deleteProductAction(id: string) {
  await assertAdmin();
  await connectDB();
  const p = await Product.findById(id);
  if (!p) return { ok: false as const, error: 'Product not found.' };
  if (p.sold > 0) {
    // Keep order history intact: archive products that have been sold.
    p.status = 'archived';
    await p.save();
  } else {
    if (isCloudinaryConfigured()) for (const img of p.images) if (img.publicId) await deleteImage(img.publicId).catch(() => {});
    await p.deleteOne();
  }
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  return { ok: true as const };
}

/** Used by the client-side wishlist page. */
export async function getWishlistProductsAction(ids: string[]) {
  return getProductsByIds(ids.slice(0, 100));
}

/** Used by the client-side cart to refresh persisted items (matched by id, or by slug if the id is stale). */
export async function refreshCartAction(items: { productId: string; slug: string }[]) {
  const list = items.slice(0, 100);
  const ids = list.map((i) => i.productId).filter((id) => /^[a-f0-9]{24}$/i.test(id));
  const slugs = list.map((i) => i.slug).filter((s) => typeof s === 'string' && s.length > 0 && s.length <= 200);
  if (!ids.length && !slugs.length) return [];
  await connectDB();
  const docs = await Product.find({ $or: [{ _id: { $in: ids } }, { slug: { $in: slugs } }], status: 'active' })
    .select('name slug price stock images art')
    .lean();
  return docs.map((d) => ({
    productId: String(d._id),
    slug: d.slug,
    name: d.name,
    price: d.price,
    stock: d.stock,
    image: d.images?.[0]?.url,
    art: d.art,
  }));
}

/* ------------------------------ Categories ------------------------------ */

const categorySchema = z.object({
  name: z.string().min(2, 'Enter a category name'),
  description: z.string().optional().default(''),
  art: z.string().optional().default('accessories'),
  order: z.coerce.number().int().default(0),
});

export async function saveCategoryAction(id: string | null, input: z.input<typeof categorySchema>) {
  await assertAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  await connectDB();
  const slug = slugify(parsed.data.name);
  const clash = await Category.exists({ slug, ...(id ? { _id: { $ne: id } } : {}) });
  if (clash) return { ok: false as const, error: 'A category with that name already exists.' };
  if (id) await Category.updateOne({ _id: id }, { ...parsed.data, slug });
  else await Category.create({ ...parsed.data, slug });
  revalidatePath('/admin/categories');
  revalidatePath('/');
  revalidatePath('/shop');
  return { ok: true as const };
}

export async function deleteCategoryAction(id: string) {
  await assertAdmin();
  await connectDB();
  const inUse = await Product.countDocuments({ category: id });
  if (inUse) return { ok: false as const, error: `Move the ${inUse} product(s) in this category first.` };
  await Category.deleteOne({ _id: id });
  revalidatePath('/admin/categories');
  return { ok: true as const };
}
