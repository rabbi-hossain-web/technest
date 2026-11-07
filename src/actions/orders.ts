'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { assertAdmin, getSession } from '@/lib/auth';
import { getSettings } from '@/lib/queries';
import { computeTotals, couponDiscount } from '@/lib/pricing';
import { Coupon, Order, Product, nextOrderNumber } from '@/models';
import type { CouponDTO } from '@/types';

/* ------------------------------ Coupons (public) ------------------------------ */

async function findUsableCoupon(code: string) {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true }).lean();
  if (!coupon) return { coupon: null, error: 'That code isn’t valid.' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { coupon: null, error: 'That code has expired.' };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return { coupon: null, error: 'That code has reached its usage limit.' };
  return { coupon: coupon as unknown as CouponDTO, error: null };
}

export async function validateCouponAction(code: string, subtotal: number) {
  if (!code.trim()) return { ok: false as const, error: 'Enter a code.' };
  await connectDB();
  const { coupon, error } = await findUsableCoupon(code);
  if (!coupon) return { ok: false as const, error: error! };
  if (subtotal < coupon.minOrder) return { ok: false as const, error: `Spend at least $${coupon.minOrder} to use this code.` };
  return {
    ok: true as const,
    code: coupon.code,
    discount: couponDiscount(coupon, subtotal),
    label: coupon.type === 'percent' ? `${coupon.value}% off` : `$${coupon.value} off`,
  };
}

/* ------------------------------ Checkout ------------------------------ */

const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().regex(/^[a-f0-9]{24}$/i), slug: z.string().max(200).optional(), qty: z.number().int().min(1).max(20) }))
    .min(1, 'Your cart is empty.'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Enter a phone number'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'Enter your first name'),
    lastName: z.string().min(1, 'Enter your last name'),
    address: z.string().min(3, 'Enter your street address'),
    city: z.string().min(2, 'Enter your city'),
    postalCode: z.string().min(2, 'Enter your postal code'),
    country: z.string().min(2),
  }),
  shippingMethod: z.enum(['standard', 'express', 'sameday']),
  paymentMethod: z.enum(['cod', 'bkash', 'card', 'paypal']),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function placeOrderAction(input: CheckoutInput): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  await connectDB();
  const session = await getSession();
  const settings = await getSettings();
  if (!settings.paymentMethods[data.paymentMethod]) return { ok: false, error: 'That payment method is not available.' };

  // Match by id, falling back to slug: carts persisted in the browser can hold a stale id
  // if the product was re-created (e.g. after re-seeding) while the slug stayed the same.
  const ids = data.items.map((i) => i.productId);
  const slugs = data.items.map((i) => i.slug).filter((s): s is string => !!s);
  const products = await Product.find({ $or: [{ _id: { $in: ids } }, { slug: { $in: slugs } }], status: 'active' }).lean();

  const lines: { product: unknown; name: string; slug: string; image: string; art: string; price: number; qty: number }[] = [];
  for (const item of data.items) {
    const p = products.find((x) => String(x._id) === item.productId) ?? (item.slug ? products.find((x) => x.slug === item.slug) : undefined);
    if (!p) return { ok: false, error: 'One of the items in your cart is no longer available.' };
    if (p.stock < item.qty) return { ok: false, error: `Only ${p.stock} left of ${p.name}. Please update your cart.` };
    lines.push({ product: p._id, name: p.name, slug: p.slug, image: p.images?.[0]?.url ?? '', art: p.art ?? '', price: p.price, qty: item.qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

  let discount = 0;
  let couponCode = '';
  if (data.couponCode) {
    const { coupon } = await findUsableCoupon(data.couponCode);
    if (coupon && subtotal >= coupon.minOrder) {
      discount = couponDiscount(coupon, subtotal);
      couponCode = coupon.code;
    }
  }
  const totals = computeTotals({ subtotal, discount, settings, method: data.shippingMethod });

  // Reserve stock atomically; roll back if any item ran out meanwhile.
  const reserved: { id: unknown; qty: number }[] = [];
  for (const l of lines) {
    const res = await Product.updateOne({ _id: l.product, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty, sold: l.qty } });
    if (res.modifiedCount !== 1) {
      for (const r of reserved) await Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty, sold: -r.qty } });
      return { ok: false, error: `${l.name} just sold out. Please update your cart.` };
    }
    reserved.push({ id: l.product, qty: l.qty });
  }

  const order = await Order.create({
    orderNumber: await nextOrderNumber(),
    user: session?.id ?? null,
    email: data.email,
    phone: data.phone,
    shippingAddress: data.shippingAddress,
    items: lines,
    ...totals,
    couponCode,
    shippingMethod: data.shippingMethod,
    paymentMethod: data.paymentMethod,
    paymentStatus: 'unpaid',
    status: 'pending',
    notes: data.notes ?? '',
    timeline: [{ status: 'pending', note: 'Order placed', at: new Date() }],
  });
  if (couponCode) await Coupon.updateOne({ code: couponCode }, { $inc: { usageCount: 1 } });

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  return { ok: true, orderId: String(order._id) };
}

/* ------------------------------ Admin ------------------------------ */

const updateSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['unpaid', 'paid', 'refunded']),
  courier: z.string().optional().default(''),
  trackingNumber: z.string().optional().default(''),
  note: z.string().optional().default(''),
});

export async function updateOrderAction(orderId: string, input: z.input<typeof updateSchema>) {
  const admin = await assertAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const d = parsed.data;

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) return { ok: false as const, error: 'Order not found.' };

  const events: { status: string; note: string; at: Date }[] = [];
  if (order.status !== d.status) {
    // Return stock to inventory when an order is cancelled (and take it back if re-opened).
    if (d.status === 'cancelled' && order.status !== 'cancelled') {
      for (const it of order.items) await Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty ?? 0, sold: -(it.qty ?? 0) } });
    } else if (order.status === 'cancelled' && d.status !== 'cancelled') {
      for (const it of order.items) await Product.updateOne({ _id: it.product }, { $inc: { stock: -(it.qty ?? 0), sold: it.qty ?? 0 } });
    }
    events.push({ status: d.status, note: `Status changed to ${d.status} by ${admin.name}`, at: new Date() });
  }
  if (order.paymentStatus !== d.paymentStatus) events.push({ status: 'payment', note: `Payment marked ${d.paymentStatus}`, at: new Date() });
  if (d.note.trim()) events.push({ status: 'note', note: d.note.trim(), at: new Date() });

  order.status = d.status;
  order.paymentStatus = d.paymentStatus;
  order.courier = d.courier;
  order.trackingNumber = d.trackingNumber;
  order.timeline.push(...events);
  await order.save();

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { ok: true as const };
}
