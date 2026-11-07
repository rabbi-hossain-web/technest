/**
 * Adds the real demo photos to an already-seeded catalog without wiping any data.
 * Only products that have no images yet are touched, so uploaded photos are kept.
 * Order line items for these products that have no image get the photo too.
 *
 *   npm run seed:images
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import mongoose from 'mongoose';
import { Order, Product } from '../src/models';
import { imagesFor, productImages } from './product-images';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing.');
  await mongoose.connect(uri);

  let products = 0;
  let orderLines = 0;
  for (const name of Object.keys(productImages)) {
    const p = await Product.findOne({ name });
    if (!p) continue;
    const images = imagesFor(name);
    if (!p.images?.length) {
      await Product.updateOne({ _id: p._id }, { $set: { images } });
      products++;
    }

    // Fill in order lines for this product that still have no image.
    const res = await Order.collection.updateMany(
      { items: { $elemMatch: { product: p._id, image: { $in: ['', null] } } } },
      { $set: { 'items.$[line].image': images[0].url } },
      { arrayFilters: [{ 'line.product': p._id, 'line.image': { $in: ['', null] } }] },
    );
    orderLines += res.modifiedCount;
  }

  console.log(`Added photos to ${products} products and ${orderLines} orders.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
