import type { CouponDTO, SettingsDTO, ShippingMethod } from '@/types';
import { round2 } from './utils';

export function couponDiscount(coupon: Pick<CouponDTO, 'type' | 'value' | 'minOrder'> | null, subtotal: number) {
  if (!coupon || subtotal < (coupon.minOrder ?? 0)) return 0;
  const raw = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  return round2(Math.min(raw, subtotal));
}

export function shippingCost(settings: SettingsDTO, method: ShippingMethod, discountedSubtotal: number) {
  if (discountedSubtotal <= 0) return 0;
  if (method === 'standard') return discountedSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingRates.standard;
  return settings.shippingRates[method];
}

export function computeTotals(opts: { subtotal: number; discount: number; settings: SettingsDTO; method: ShippingMethod }) {
  const afterDiscount = Math.max(0, opts.subtotal - opts.discount);
  const shipping = shippingCost(opts.settings, opts.method, afterDiscount);
  const tax = round2((afterDiscount * opts.settings.taxRate) / 100);
  return { subtotal: round2(opts.subtotal), discount: round2(opts.discount), shipping, tax, total: round2(afterDiscount + shipping + tax) };
}
