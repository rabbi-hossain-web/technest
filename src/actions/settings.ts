'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { assertAdmin } from '@/lib/auth';
import { Setting } from '@/models';

const settingsSchema = z.object({
  storeName: z.string().min(1),
  tagline: z.string().default(''),
  supportEmail: z.string().email('Enter a valid support email'),
  supportPhone: z.string().default(''),
  currency: z.string().length(3),
  freeShippingThreshold: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100),
  shippingRates: z.object({ standard: z.coerce.number().min(0), express: z.coerce.number().min(0), sameday: z.coerce.number().min(0) }),
  paymentMethods: z.object({ cod: z.boolean(), bkash: z.boolean(), card: z.boolean(), paypal: z.boolean() }),
  dealsEndAt: z.string().optional().default(''),
});

export async function saveSettingsAction(input: z.input<typeof settingsSchema>) {
  await assertAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  await connectDB();
  const d = parsed.data;
  await Setting.findOneAndUpdate(
    { key: 'store' },
    { ...d, dealsEndAt: d.dealsEndAt ? new Date(d.dealsEndAt) : null },
    { upsert: true, setDefaultsOnInsert: true },
  );
  revalidatePath('/', 'layout');
  return { ok: true as const };
}
