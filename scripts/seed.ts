/**
 * Seeds MongoDB with categories, products, coupons, settings, an admin account,
 * demo customers and a year of sample orders so every page has data.
 *
 *   npm run seed            → adds data (skips if products already exist)
 *   npm run seed -- --reset → wipes the store collections first
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Category, Coupon, Counter, Message, Order, Product, Review, Setting, User } from '../src/models';
import { slugify } from '../src/lib/utils';
import { imagesFor } from './product-images';

const RESET = process.argv.includes('--reset');

// Catalog prices below are written in USD for readability and converted to BDT on insert.
const USD_TO_BDT = 120;
/** Retail-style taka price, e.g. 249 USD → ৳29,890. */
const bdtPrice = (usd: number) => Math.round((usd * USD_TO_BDT) / 100) * 100 - 10;
/** Plain taka amount rounded to the nearest 10. */
const bdt = (usd: number) => Math.round((usd * USD_TO_BDT) / 10) * 10;

const categories = [
  { name: 'Laptops & Computers', art: 'laptop' },
  { name: 'Smartphones & Accessories', art: 'phone' },
  { name: 'Audio & Headphones', art: 'headphones' },
  { name: 'Smartwatches & Wearables', art: 'watch' },
  { name: 'Tablets & eReaders', art: 'tablet' },
  { name: 'Gaming & Consoles', art: 'gamepad' },
  { name: 'Cameras & Drones', art: 'camera' },
  { name: 'Accessories & More', art: 'accessories' },
];

type SeedProduct = {
  name: string; brand: string; cat: number; price: number; compareAtPrice?: number; cost: number; stock: number; sold: number;
  art: string; featured?: boolean; badge?: string; short: string; description: string; specs: [string, string][]; tags: string[];
};

const products: SeedProduct[] = [
  { name: 'Apple AirPods Pro (2nd Gen)', brand: 'Apple', cat: 2, price: 249, cost: 168, stock: 112, sold: 318, art: 'earbuds', featured: true, badge: 'Best Seller',
    short: 'Active noise cancellation with Adaptive Audio.', description: 'Up to 2x more active noise cancellation, Adaptive Transparency and personalised spatial audio. The MagSafe charging case (USB‑C) adds a speaker for Find My and a lanyard loop.',
    specs: [['Noise cancellation', 'Active, with Adaptive Audio'], ['Battery', 'Up to 6 hours (30 with case)'], ['Charging', 'USB‑C, MagSafe, Qi'], ['Water resistance', 'IP54']], tags: ['earbuds', 'wireless', 'anc'] },
  { name: 'Apple Watch Series 10', brand: 'Apple', cat: 3, price: 399, cost: 270, stock: 27, sold: 121, art: 'watch', featured: true,
    short: 'Thinnest Apple Watch with the biggest display.', description: 'A wide-angle OLED display, faster charging and advanced health features including sleep apnea notifications.',
    specs: [['Case size', '46 mm'], ['Display', 'Wide-angle OLED, always-on'], ['Battery', 'Up to 18 hours'], ['Water resistance', '50 m']], tags: ['smartwatch', 'fitness'] },
  { name: 'MacBook Air M3 (13-inch)', brand: 'Apple', cat: 0, price: 1099, cost: 820, stock: 21, sold: 96, art: 'laptop', featured: true,
    short: 'Strikingly thin and fast with the M3 chip.', description: 'The M3 chip brings faster performance and up to 18 hours of battery life in a fanless design that stays completely silent.',
    specs: [['Chip', 'Apple M3, 8-core CPU'], ['Memory', '16GB unified memory'], ['Storage', '256GB SSD'], ['Display', '13.6-inch Liquid Retina'], ['Battery', 'Up to 18 hours']], tags: ['laptop', 'macbook'] },
  { name: 'iPhone 16 (128GB)', brand: 'Apple', cat: 1, price: 799, cost: 590, stock: 54, sold: 214, art: 'phone', featured: true, badge: 'New',
    short: 'Camera Control, A18 chip and all-day battery.', description: 'iPhone 16 brings a faster chip, a customisable Action button and a dedicated Camera Control for quicker shots. The 6.1-inch display is bright enough for direct sunlight.',
    specs: [['Display', '6.1-inch Super Retina XDR'], ['Chip', 'A18'], ['Camera', '48MP Fusion + 12MP Ultra Wide'], ['Storage', '128GB'], ['Connector', 'USB‑C']], tags: ['iphone', 'smartphone'] },
  { name: 'Sony WH-1000XM5', brand: 'Sony', cat: 2, price: 348, compareAtPrice: 399, cost: 242, stock: 38, sold: 142, art: 'headphones', featured: true,
    short: 'Industry-leading noise cancellation.', description: 'Eight microphones and two processors cancel more noise than ever. Up to 30 hours of battery, quick charge (3 min = 3 hours) and multipoint pairing.',
    specs: [['Noise cancellation', 'Dual processor, 8 mics'], ['Battery', 'Up to 30 hours'], ['Quick charge', '3 min for 3 hours'], ['Weight', '250 g']], tags: ['headphones', 'anc', 'wireless'] },
  { name: 'PlayStation 5 Slim', brand: 'Sony', cat: 5, price: 499, cost: 410, stock: 3, sold: 77, art: 'console', featured: true,
    short: 'Slimmer design, same next-gen performance.', description: 'Ultra-high-speed SSD, ray tracing, 4K gaming up to 120 fps and the DualSense wireless controller with haptic feedback.',
    specs: [['Storage', '1TB SSD'], ['Resolution', 'Up to 4K 120Hz'], ['Drive', 'Ultra HD Blu-ray'], ['In the box', 'DualSense controller']], tags: ['console', 'gaming'] },
  { name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', cat: 1, price: 1299, cost: 960, stock: 6, sold: 58, art: 'phone',
    short: 'Galaxy AI, built-in S Pen and a 200MP camera.', description: 'A titanium frame, the brightest Galaxy display yet and a 200MP main camera with 5x optical zoom. Galaxy AI helps you edit, translate and search.',
    specs: [['Display', '6.9-inch Dynamic AMOLED 2X'], ['Camera', '200MP + 50MP + 50MP + 10MP'], ['Storage', '256GB'], ['Battery', '5,000 mAh']], tags: ['android', 'smartphone'] },
  { name: 'Dell XPS 14', brand: 'Dell', cat: 0, price: 1499, cost: 1120, stock: 12, sold: 31, art: 'laptop',
    short: 'Premium 14-inch performance laptop.', description: 'Intel Core Ultra 7, a 3.2K OLED touch display option and a seamless glass touchpad in a CNC aluminium body.',
    specs: [['Processor', 'Intel Core Ultra 7 155H'], ['Memory', '16GB LPDDR5x'], ['Storage', '512GB SSD'], ['Display', '14.5-inch FHD+ 120Hz']], tags: ['laptop', 'windows'] },
  { name: 'ASUS Zenbook 14 OLED', brand: 'ASUS', cat: 0, price: 749, compareAtPrice: 999, cost: 610, stock: 32, sold: 68, art: 'laptop', badge: 'Deal of the day',
    short: '3K OLED, Core Ultra 7, ultra-light at 1.2 kg.', description: 'A gorgeous 14-inch 3K OLED display, Intel Core Ultra 7, 16GB RAM and 1TB SSD in a 1.2 kg chassis.',
    specs: [['Processor', 'Intel Core Ultra 7'], ['Memory', '16GB'], ['Storage', '1TB SSD'], ['Weight', '1.2 kg']], tags: ['laptop', 'oled'] },
  { name: 'Samsung Galaxy Watch7', brand: 'Samsung', cat: 3, price: 229, compareAtPrice: 329, cost: 170, stock: 25, sold: 54, art: 'watch',
    short: 'Advanced health tracking with Galaxy AI.', description: 'Energy Score, sleep coaching and dual-frequency GPS in a lightweight design.',
    specs: [['Case size', '44 mm'], ['Battery', 'Up to 40 hours'], ['GPS', 'Dual-frequency L1+L5']], tags: ['smartwatch', 'android'] },
  { name: 'iPad Air 11-inch (M2)', brand: 'Apple', cat: 4, price: 599, cost: 440, stock: 19, sold: 63, art: 'tablet',
    short: 'Serious performance in a thin, light design.', description: 'The M2 chip, a Liquid Retina display and support for Apple Pencil Pro and Magic Keyboard.',
    specs: [['Chip', 'Apple M2'], ['Display', '11-inch Liquid Retina'], ['Storage', '128GB'], ['Connector', 'USB‑C']], tags: ['tablet', 'ipad'] },
  { name: 'Wireless Pro Controller', brand: 'Nintendo', cat: 5, price: 44.99, compareAtPrice: 69.99, cost: 30, stock: 60, sold: 47, art: 'gamepad',
    short: 'Precision controls with HD rumble.', description: 'A full-size wireless controller with motion controls, HD rumble and up to 40 hours of battery.',
    specs: [['Battery', 'Up to 40 hours'], ['Connection', 'Bluetooth / USB‑C']], tags: ['controller', 'gaming'] },
  { name: 'Canon EOS R50 Kit', brand: 'Canon', cat: 6, price: 679, cost: 520, stock: 4, sold: 33, art: 'camera',
    short: 'Compact mirrorless camera for creators.', description: '24.2MP APS-C sensor, 4K video, subject detection autofocus and a vari-angle touchscreen. Includes RF-S 18-45mm lens.',
    specs: [['Sensor', '24.2MP APS-C'], ['Video', '4K 30p'], ['Lens', 'RF-S 18-45mm'], ['Weight', '375 g']], tags: ['camera', 'mirrorless'] },
  { name: 'Logitech MX Master 3S', brand: 'Logitech', cat: 7, price: 69.99, compareAtPrice: 99.99, cost: 48, stock: 76, sold: 66, art: 'mouse',
    short: 'Quiet clicks, 8K DPI tracking on any surface.', description: 'An iconic performance mouse with MagSpeed scrolling, quiet clicks and multi-device control.',
    specs: [['Sensor', '8,000 DPI'], ['Battery', 'Up to 70 days'], ['Connection', 'Bluetooth / Logi Bolt']], tags: ['mouse', 'productivity'] },
  { name: 'Logitech MX Keys S', brand: 'Logitech', cat: 7, price: 109.99, cost: 74, stock: 40, sold: 29, art: 'keyboard',
    short: 'Smart illuminated wireless keyboard.', description: 'Comfortable spherically-dished keys, smart backlighting and customisable Smart Actions.',
    specs: [['Layout', 'Full size'], ['Backlight', 'Smart illumination'], ['Battery', 'Up to 10 days (backlit)']], tags: ['keyboard', 'productivity'] },
  { name: 'JBL Flip 6 Speaker', brand: 'JBL', cat: 2, price: 89.95, compareAtPrice: 129.95, cost: 60, stock: 44, sold: 40, art: 'speaker',
    short: 'Bold sound, waterproof and dustproof.', description: 'A 2-way speaker system with powerful, clear sound, IP67 rating and 12 hours of playtime.',
    specs: [['Playtime', 'Up to 12 hours'], ['Rating', 'IP67'], ['Connection', 'Bluetooth 5.1']], tags: ['speaker', 'portable'] },
  { name: '20,000 mAh USB‑C Power Bank', brand: 'Anker', cat: 7, price: 39.99, cost: 22, stock: 120, sold: 88, art: 'accessories',
    short: 'Charge a laptop and phone at once.', description: '30W USB‑C Power Delivery with two ports and a smart display that shows the remaining charge.',
    specs: [['Capacity', '20,000 mAh'], ['Output', '30W USB‑C PD'], ['Ports', '1× USB‑C, 1× USB‑A']], tags: ['power bank', 'charging'] },
];

const firstNames = ['Rahim', 'Emily', 'Tanvir', 'Priya', 'Lucas', 'Ayesha', 'Daniel', 'Sofia', 'Mehedi', 'Grace', 'Nusrat', 'Omar'];
const lastNames = ['Ahmed', 'Carter', 'Hossain', 'Nair', 'Martin', 'Siddiqua', 'Kim', 'Rossi', 'Hasan', 'Lee', 'Jahan', 'Farooq'];
const cities = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Austin', 'Toronto', 'London'];

// Small deterministic PRNG so every seed produces the same demo data.
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing. Create .env.local first (see .env.example).');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  if (RESET) {
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Counter.deleteMany({});
    await User.deleteMany({ role: 'customer' });
    console.log('Cleared store collections');
  }

  // Settings
  await Setting.findOneAndUpdate({ key: 'store' }, { $set: { currency: 'BDT' } }, { upsert: true, setDefaultsOnInsert: true });

  // Admin
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@technest.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ name: 'Store Admin', email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10), role: 'admin' });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  if ((await Product.countDocuments()) > 0) {
    console.log('Products already exist — skipping catalog. Run `npm run seed -- --reset` to start fresh.');
    await mongoose.disconnect();
    return;
  }

  // Categories
  const cats = await Category.insertMany(categories.map((c, i) => ({ ...c, slug: slugify(c.name), order: i })));
  console.log(`Inserted ${cats.length} categories`);

  // Products
  const prods = await Product.insertMany(
    products.map((p) => ({
      name: p.name, slug: slugify(p.name), brand: p.brand, category: cats[p.cat]._id, price: bdtPrice(p.price), compareAtPrice: p.compareAtPrice ? bdtPrice(p.compareAtPrice) : null,
      cost: bdt(p.cost), stock: p.stock, sold: p.sold, art: p.art, featured: !!p.featured, badge: p.badge ?? '', shortDescription: p.short,
      description: p.description, specs: p.specs.map(([key, value]) => ({ key, value })), tags: p.tags, status: 'active',
      sku: `${p.brand.slice(0, 3).toUpperCase()}-${slugify(p.name).slice(0, 14).toUpperCase()}`, images: imagesFor(p.name),
    })),
  );
  console.log(`Inserted ${prods.length} products`);

  // Coupons
  await Coupon.insertMany([
    { code: 'NEST10', description: 'First order', type: 'percent', value: 10, minOrder: 10000 },
    { code: 'FREESHIP', description: 'Free standard shipping', type: 'fixed', value: 80, minOrder: 0 },
    { code: 'AUDIO25', description: 'Headphones & speakers', type: 'fixed', value: 3000, minOrder: 15000, active: false },
  ]);

  // Customers
  const passwordHash = await bcrypt.hash('Customer@123', 10);
  // Raw driver insert keeps our back-dated createdAt values (Mongoose timestamps would overwrite them).
  const customerDocs = firstNames.map((f, i) => ({
      _id: new mongoose.Types.ObjectId(),
      name: `${f} ${lastNames[i]}`, email: `${f.toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`, passwordHash, role: 'customer',
      phone: `+880 17${String(10000000 + i * 734521).slice(0, 8)}`,
      address: { firstName: f, lastName: lastNames[i], address: `House ${10 + i}, Road ${3 + (i % 9)}`, city: cities[i % cities.length], postalCode: String(1200 + i), country: i < 8 ? 'Bangladesh' : 'United States' },
      createdAt: new Date(Date.now() - (30 + i * 25) * 86400000),
      updatedAt: new Date(),
    }));
  await User.collection.insertMany(customerDocs);
  const customers = customerDocs;
  console.log(`Inserted ${customers.length} demo customers (password: Customer@123)`);

  // Orders across the last 12 months
  const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'pending', 'cancelled'] as const;
  const payments = ['cod', 'bkash', 'card', 'cod'] as const;
  const orders: Record<string, unknown>[] = [];
  for (let i = 0; i < 90; i++) {
    const daysAgo = Math.floor(rand() * 360);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000));
    const cust = pick(customers);
    const lineCount = 1 + Math.floor(rand() * 3);
    const lines = Array.from({ length: lineCount }, () => {
      const p = pick(prods);
      return { product: p._id, name: p.name, slug: p.slug, image: p.images[0]?.url ?? '', art: p.art, price: p.price, qty: 1 + Math.floor(rand() * 2) };
    });
    const subtotal = Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100;
    const shipping = subtotal >= 5000 ? 0 : 80;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const status = daysAgo < 3 ? pick(['pending', 'processing'] as const) : daysAgo < 8 ? pick(['processing', 'shipped'] as const) : pick([...statuses]);
    orders.push({
      orderNumber: `TN-${20000 + i}`, user: cust._id, email: cust.email, phone: cust.phone,
      shippingAddress: cust.address, items: lines, subtotal, discount: 0, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100,
      shippingMethod: 'standard', paymentMethod: pick([...payments]), paymentStatus: status === 'delivered' ? 'paid' : status === 'cancelled' ? 'refunded' : 'unpaid',
      status, timeline: [{ status: 'pending', note: 'Order placed', at: createdAt }], createdAt, updatedAt: createdAt,
    });
  }
  await Order.collection.insertMany(orders.map((o) => ({ ...o, couponCode: '', courier: '', trackingNumber: '', notes: '' })));
  await Counter.findOneAndUpdate({ _id: 'order' }, { seq: 100 }, { upsert: true });
  console.log(`Inserted ${orders.length} sample orders`);

  // Reviews
  const reviewTexts = [
    { rating: 5, title: 'Exactly as described', body: 'Fast delivery, sealed box and it works perfectly. Would buy from TechNest again.' },
    { rating: 4, title: 'Great value', body: 'Really happy with it. Packaging could be a little better but the product is excellent.' },
    { rating: 5, title: 'Love it', body: 'Battery life is fantastic and the build quality feels premium.' },
  ];
  for (const p of prods) {
    const n = 2 + Math.floor(rand() * 2);
    const reviewers = [...customers].sort(() => rand() - 0.5).slice(0, n);
    const docs = reviewers.map((u, i) => ({ product: p._id, user: u._id, name: u.name, ...reviewTexts[i % reviewTexts.length] }));
    await Review.insertMany(docs);
    const avg = docs.reduce((s, d) => s + d.rating, 0) / docs.length;
    await Product.updateOne({ _id: p._id }, { rating: Math.round(avg * 10) / 10, numReviews: docs.length });
  }
  console.log('Inserted reviews');

  await Message.create({ name: 'Emily Carter', email: 'emily.carter@example.com', topic: 'Order status', message: 'Hi! Could you tell me when my headphones will ship? Thanks.', orderNumber: 'TN-20012' });

  await mongoose.disconnect();
  console.log('\n✅ Seed complete. Start the app with `npm run dev`.');
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
