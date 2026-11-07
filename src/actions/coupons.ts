'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { assertAdmin } from '@/lib/auth';
import { Coupon } from '@/models';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(30).regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, - or _ only'),
  description: z.string().optional().default(''),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().positive('Value must be greater than 0'),
  minOrder: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  expiresAt: z.string().optional().default(''),
});

export async function createCouponAction(input: z.input<typeof couponSchema>) {
  await assertAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.type === 'percent' && d.value > 100) return { ok: false as const, error: 'Percentage cannot exceed 100.' };
  await connectDB();
  const code = d.code.toUpperCase();
  if (await Coupon.exists({ code })) return { ok: false as const, error: 'That code already exists.' };
  await Coupon.create({ ...d, code, usageLimit: d.usageLimit || null, expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T23:59:59`) : null });
  revalidatePath('/admin/discounts');
  return { ok: true as const };
}

export async function toggleCouponAction(id: string, active: boolean) {
  await assertAdmin();
  await connectDB();
  await Coupon.updateOne({ _id: id }, { active });
  revalidatePath('/admin/discounts');
  return { ok: true as const };
}

export async function deleteCouponAction(id: string) {
  await assertAdmin();
  await connectDB();
  await Coupon.deleteOne({ _id: id });
  revalidatePath('/admin/discounts');
  return { ok: true as const };
}
