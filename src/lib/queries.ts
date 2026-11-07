import { connectDB } from './db';
import { Category, Coupon, Message, Order, Product, Review, Setting, User } from '@/models';
import { escapeRegex, serialize } from './utils';
import type { CategoryDTO, CouponDTO, MessageDTO, OrderDTO, ProductDTO, ReviewDTO, SettingsDTO } from '@/types';
import type { SortOrder } from 'mongoose';

export const DEFAULT_SETTINGS: SettingsDTO = {
  storeName: 'TechNest',
  tagline: 'Smarter Gadgets. Better Life.',
  supportEmail: 'support@technest.com',
  supportPhone: '',
  currency: 'BDT',
  freeShippingThreshold: 5000,
  taxRate: 8,
  shippingRates: { standard: 80, express: 150, sameday: 250 },
  paymentMethods: { cod: true, bkash: true, card: false, paypal: false },
  dealsEndAt: null,
};

export async function getSettings(): Promise<SettingsDTO> {
  await connectDB();
  const doc = await Setting.findOne({ key: 'store' }).lean();
  if (!doc) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...serialize<Partial<SettingsDTO>>(doc) };
}

export async function getCategories(): Promise<CategoryDTO[]> {
  await connectDB();
  const docs = await Category.find().sort({ order: 1, name: 1 }).lean();
  return serialize<CategoryDTO[]>(docs);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductDTO[]> {
  await connectDB();
  let docs = await Product.find({ status: 'active', featured: true }).sort({ sold: -1 }).limit(limit).populate('category').lean();
  if (docs.length < limit) {
    const more = await Product.find({ status: 'active', _id: { $nin: docs.map((d) => d._id) } })
      .sort({ rating: -1 })
      .limit(limit - docs.length)
      .populate('category')
      .lean();
    docs = [...docs, ...more];
  }
  return serialize<ProductDTO[]>(docs);
}

export async function getBestseller(): Promise<ProductDTO | null> {
  await connectDB();
  const doc = await Product.findOne({ status: 'active', $expr: { $gt: ['$compareAtPrice', '$price'] } })
    .sort({ sold: -1 })
    .lean();
  return doc ? serialize<ProductDTO>(doc) : null;
}

export async function getBrands(): Promise<string[]> {
  await connectDB();
  const brands = await Product.distinct('brand', { status: 'active' });
  return (brands as string[]).filter(Boolean).sort();
}

export type ShopFilters = {
  q?: string;
  category?: string;
  brands?: string[];
  min?: number;
  max?: number;
  sale?: boolean;
  inStock?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
};

export async function getProducts(filters: ShopFilters) {
  await connectDB();
  const query: Record<string, unknown> = { status: 'active' };
  const and: Record<string, unknown>[] = [];

  if (filters.q) {
    const rx = new RegExp(escapeRegex(filters.q), 'i');
    and.push({ $or: [{ name: rx }, { brand: rx }, { tags: rx }] });
  }
  let category: CategoryDTO | null = null;
  if (filters.category) {
    const c = await Category.findOne({ slug: filters.category }).lean();
    if (c) {
      category = serialize<CategoryDTO>(c);
      query.category = c._id;
    }
  }
  if (filters.brands?.length) query.brand = { $in: filters.brands };
  if (filters.min != null || filters.max != null) {
    const price: Record<string, number> = {};
    if (filters.min != null && !Number.isNaN(filters.min)) price.$gte = filters.min;
    if (filters.max != null && !Number.isNaN(filters.max)) price.$lte = filters.max;
    if (Object.keys(price).length) query.price = price;
  }
  if (filters.sale) and.push({ $expr: { $gt: ['$compareAtPrice', '$price'] } });
  if (filters.inStock) query.stock = { $gt: 0 };
  if (and.length) query.$and = and;

  const sorts: Record<string, Record<string, SortOrder>> = {
    featured: { featured: -1, sold: -1 },
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1, numReviews: -1 },
  };
  const sort = sorts[filters.sort ?? 'featured'] ?? sorts.featured;
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  const [docs, total] = await Promise.all([
    Product.find(query).sort(sort).skip((page - 1) * perPage).limit(perPage).populate('category').lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: serialize<ProductDTO[]>(docs),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    category,
  };
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  await connectDB();
  const rows = await Product.aggregate<{ _id: unknown; n: number }>([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
}

export async function getProductBySlug(slug: string, includeHidden = false): Promise<ProductDTO | null> {
  await connectDB();
  const query: Record<string, unknown> = { slug };
  if (!includeHidden) query.status = 'active';
  const doc = await Product.findOne(query).populate('category').lean();
  return doc ? serialize<ProductDTO>(doc) : null;
}

export async function getRelatedProducts(product: ProductDTO, limit = 5): Promise<ProductDTO[]> {
  await connectDB();
  const docs = await Product.find({ status: 'active', _id: { $ne: product._id }, ...(product.category ? { category: product.category._id } : {}) })
    .sort({ sold: -1 })
    .limit(limit)
    .lean();
  return serialize<ProductDTO[]>(docs);
}

export async function getReviews(productId: string): Promise<ReviewDTO[]> {
  await connectDB();
  const docs = await Review.find({ product: productId }).sort({ createdAt: -1 }).limit(50).lean();
  return serialize<ReviewDTO[]>(docs);
}

export async function getDeals(limit = 24): Promise<ProductDTO[]> {
  await connectDB();
  const docs = await Product.aggregate([
    { $match: { status: 'active', $expr: { $gt: ['$compareAtPrice', '$price'] } } },
    { $addFields: { _off: { $divide: [{ $subtract: ['$compareAtPrice', '$price'] }, '$compareAtPrice'] } } },
    { $sort: { _off: -1 } },
    { $limit: limit },
  ]);
  return serialize<ProductDTO[]>(docs);
}

export async function getProductsByIds(ids: string[]): Promise<ProductDTO[]> {
  await connectDB();
  const valid = ids.filter((id) => /^[a-f0-9]{24}$/i.test(id));
  if (!valid.length) return [];
  const docs = await Product.find({ _id: { $in: valid }, status: { $ne: 'archived' } }).lean();
  return serialize<ProductDTO[]>(docs);
}

export async function getOrderById(id: string): Promise<OrderDTO | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  await connectDB();
  const doc = await Order.findById(id).lean();
  return doc ? serialize<OrderDTO>(doc) : null;
}

export async function getOrdersForUser(userId: string): Promise<OrderDTO[]> {
  await connectDB();
  const docs = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return serialize<OrderDTO[]>(docs);
}

/* ----------------------------- Admin queries ----------------------------- */

export async function getAdminOrders(opts: { status?: string; q?: string; page?: number }) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (opts.status && opts.status !== 'all') query.status = opts.status;
  if (opts.q) {
    const rx = new RegExp(escapeRegex(opts.q), 'i');
    query.$or = [{ orderNumber: rx }, { email: rx }, { 'shippingAddress.firstName': rx }, { 'shippingAddress.lastName': rx }];
  }
  const perPage = 20;
  const page = Math.max(1, opts.page ?? 1);
  const [docs, total, counts] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
    Order.countDocuments(query),
    Order.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const byStatus = Object.fromEntries(counts.map((c) => [c._id, c.n])) as Record<string, number>;
  byStatus.all = counts.reduce((s, c) => s + c.n, 0);
  return { orders: serialize<OrderDTO[]>(docs), total, page, pages: Math.max(1, Math.ceil(total / perPage)), byStatus };
}

export async function getAdminProducts(opts: { q?: string; category?: string; status?: string; page?: number }) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (opts.q) {
    const rx = new RegExp(escapeRegex(opts.q), 'i');
    query.$or = [{ name: rx }, { sku: rx }, { brand: rx }];
  }
  if (opts.category && /^[a-f0-9]{24}$/i.test(opts.category)) query.category = opts.category;
  if (opts.status && opts.status !== 'all') query.status = opts.status;
  const perPage = 20;
  const page = Math.max(1, opts.page ?? 1);
  const [docs, total] = await Promise.all([
    Product.find(query).sort({ updatedAt: -1 }).skip((page - 1) * perPage).limit(perPage).populate('category').lean(),
    Product.countDocuments(query),
  ]);
  return { products: serialize<ProductDTO[]>(docs), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getAdminProduct(id: string): Promise<ProductDTO | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  await connectDB();
  const doc = await Product.findById(id).lean();
  return doc ? serialize<ProductDTO>(doc) : null;
}

export type CustomerRow = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  createdAt: string;
  orders: number;
  spent: number;
  lastOrder?: string | null;
};

export async function getCustomers(q?: string): Promise<CustomerRow[]> {
  await connectDB();
  const match: Record<string, unknown> = { role: 'customer' };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    match.$or = [{ name: rx }, { email: rx }];
  }
  const rows = await User.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $limit: 200 },
    { $lookup: { from: 'orders', localField: '_id', foreignField: 'user', as: 'orders' } },
    {
      $project: {
        name: 1, email: 1, phone: 1, createdAt: 1, city: '$address.city',
        orders: { $size: '$orders' },
        spent: {
          $sum: {
            $map: {
              input: { $filter: { input: '$orders', as: 'o', cond: { $ne: ['$$o.status', 'cancelled'] } } },
              as: 'o',
              in: '$$o.total',
            },
          },
        },
        lastOrder: { $max: '$orders.createdAt' },
      },
    },
  ]);
  return serialize<CustomerRow[]>(rows);
}

export async function getCoupons(): Promise<CouponDTO[]> {
  await connectDB();
  const docs = await Coupon.find().sort({ createdAt: -1 }).lean();
  return serialize<CouponDTO[]>(docs);
}

export async function getMessages(): Promise<MessageDTO[]> {
  await connectDB();
  const docs = await Message.find().sort({ createdAt: -1 }).limit(200).lean();
  return serialize<MessageDTO[]>(docs);
}

export async function getDashboardStats() {
  await connectDB();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const yearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const notCancelled = { status: { $ne: 'cancelled' } };

  const [thisMonth, lastMonth, newCustomers, prevCustomers, monthly, recent, top, lowStock, byCategory, unread] = await Promise.all([
    Order.aggregate<{ revenue: number; orders: number }>([
      { $match: { ...notCancelled, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate<{ revenue: number; orders: number }>([
      { $match: { ...notCancelled, createdAt: { $gte: prevMonthStart, $lt: monthStart } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: 'customer', createdAt: { $gte: monthStart } }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: prevMonthStart, $lt: monthStart } }),
    Order.aggregate<{ _id: { y: number; m: number }; revenue: number }>([
      { $match: { ...notCancelled, createdAt: { $gte: yearAgo } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, revenue: { $sum: '$total' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(),
    Product.find({ status: 'active' }).sort({ sold: -1 }).limit(5).lean(),
    Product.find({ status: 'active', stock: { $lte: 5 } }).sort({ stock: 1 }).limit(6).lean(),
    Order.aggregate<{ _id: string; revenue: number }>([
      { $match: notCancelled },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'p' } },
      { $unwind: '$p' },
      { $lookup: { from: 'categories', localField: 'p.category', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $group: { _id: '$c.name', revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),
    Message.countDocuments({ read: false }),
  ]);

  const tm = thisMonth[0] ?? { revenue: 0, orders: 0 };
  const lm = lastMonth[0] ?? { revenue: 0, orders: 0 };
  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : a ? 100 : 0);

  const months: { label: string; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const hit = monthly.find((m) => m._id.y === d.getFullYear() && m._id.m === d.getMonth() + 1);
    months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), revenue: hit?.revenue ?? 0 });
  }
  const catTotal = byCategory.reduce((s, c) => s + c.revenue, 0) || 1;

  return {
    revenue: tm.revenue,
    revenueDelta: pct(tm.revenue, lm.revenue),
    orders: tm.orders,
    ordersDelta: pct(tm.orders, lm.orders),
    customers: newCustomers,
    customersDelta: pct(newCustomers, prevCustomers),
    aov: tm.orders ? tm.revenue / tm.orders : 0,
    aovDelta: pct(tm.orders ? tm.revenue / tm.orders : 0, lm.orders ? lm.revenue / lm.orders : 0),
    months,
    recent: serialize<OrderDTO[]>(recent),
    top: serialize<ProductDTO[]>(top),
    lowStock: serialize<ProductDTO[]>(lowStock),
    byCategory: byCategory.map((c) => ({ name: c._id, share: Math.round((c.revenue / catTotal) * 100) })),
    unreadMessages: unread,
  };
}
