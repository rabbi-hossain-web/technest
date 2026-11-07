/**
 * One-time migration: converts every stored money amount from USD to BDT
 * and switches the store currency setting to BDT.
 *
 *   npx tsx scripts/migrate-to-bdt.ts            → uses the default rate (120)
 *   npx tsx scripts/migrate-to-bdt.ts --rate=122 → custom USD→BDT rate
 *
 * Safe to re-run: it does nothing once the store currency is already BDT.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import mongoose from 'mongoose';
import { Coupon, Order, Product, Setting } from '../src/models';

const rateArg = process.argv.find((a) => a.startsWith('--rate='));
const RATE = rateArg ? Number(rateArg.split('=')[1]) : 120;

const taka = (usd: number | null | undefined) => (usd == null ? usd : Math.round(usd * RATE));
const retail = (usd: number | null | undefined) => (usd == null ? usd : Math.round((usd * RATE) / 100) * 100 - 10);

async function main() {
  if (!Number.isFinite(RATE) || RATE <= 0) throw new Error(`Invalid rate: ${rateArg}`);
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing.');
  await mongoose.connect(uri);

  const settings = await Setting.findOne({ key: 'store' }).lean();
  if (settings?.currency === 'BDT') {
    console.log('Store currency is already BDT — nothing to do.');
    return mongoose.disconnect();
  }
  console.log(`Converting USD → BDT at ${RATE}`);

  const products = await Product.find({}, { price: 1, compareAtPrice: 1, cost: 1 }).lean();
  if (products.length) {
    await Product.collection.bulkWrite(
      products.map((p) => ({
        updateOne: { filter: { _id: p._id }, update: { $set: { price: retail(p.price), compareAtPrice: retail(p.compareAtPrice), cost: taka(p.cost) } } },
      })),
    );
  }
  console.log(`Products: ${products.length}`);

  const coupons = await Coupon.find({}, { type: 1, value: 1, minOrder: 1 }).lean();
  if (coupons.length) {
    await Coupon.collection.bulkWrite(
      coupons.map((c) => ({
        updateOne: {
          filter: { _id: c._id },
          update: { $set: { minOrder: taka(c.minOrder), ...(c.type === 'fixed' ? { value: taka(c.value) } : {}) } },
        },
      })),
    );
  }
  console.log(`Coupons: ${coupons.length}`);

  const orders = await Order.find({}, { items: 1, subtotal: 1, discount: 1, shipping: 1, tax: 1, total: 1 }).lean();
  if (orders.length) {
    await Order.collection.bulkWrite(
      orders.map((o) => ({
        updateOne: {
          filter: { _id: o._id },
          update: {
            $set: {
              items: o.items.map((i) => ({ ...i, price: taka(i.price) })),
              subtotal: taka(o.subtotal), discount: taka(o.discount), shipping: taka(o.shipping), tax: taka(o.tax), total: taka(o.total),
            },
          },
        },
      })),
    );
  }
  console.log(`Orders: ${orders.length}`);

  await Setting.findOneAndUpdate(
    { key: 'store' },
    {
      $set: {
        currency: 'BDT',
        freeShippingThreshold: taka(settings?.freeShippingThreshold ?? 50),
        'shippingRates.standard': taka(settings?.shippingRates?.standard ?? 7.99),
        'shippingRates.express': taka(settings?.shippingRates?.express ?? 14.99),
        'shippingRates.sameday': taka(settings?.shippingRates?.sameday ?? 24.99),
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
  console.log('Settings switched to BDT. Done.');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
