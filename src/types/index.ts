export type Role = 'customer' | 'admin';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type ArtKind =
  | 'laptop' | 'phone' | 'headphones' | 'watch' | 'earbuds' | 'tablet' | 'gamepad'
  | 'console' | 'camera' | 'mouse' | 'speaker' | 'keyboard' | 'accessories';

export type ProductImage = { url: string; publicId: string };

export type CategoryDTO = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  art?: ArtKind;
  image?: ProductImage | null;
  order?: number;
};

export type ProductDTO = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand: string;
  category?: CategoryDTO | null;
  price: number;
  compareAtPrice?: number | null;
  cost?: number | null;
  images: ProductImage[];
  art?: ArtKind;
  stock: number;
  sold: number;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  badge?: string;
  rating: number;
  numReviews: number;
  specs: { key: string; value: string }[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ReviewDTO = {
  _id: string;
  product: string;
  user: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cod' | 'bkash' | 'card' | 'paypal';
export type ShippingMethod = 'standard' | 'express' | 'sameday';

export type OrderItemDTO = {
  product: string;
  name: string;
  slug: string;
  image?: string;
  art?: ArtKind;
  price: number;
  qty: number;
};

export type AddressDTO = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderDTO = {
  _id: string;
  orderNumber: string;
  user?: string | null;
  email: string;
  phone: string;
  shippingAddress: AddressDTO;
  items: OrderItemDTO[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  courier?: string;
  trackingNumber?: string;
  notes?: string;
  timeline: { status: string; note: string; at: string }[];
  createdAt: string;
  updatedAt: string;
};

export type CouponDTO = {
  _id: string;
  code: string;
  description?: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  usageLimit?: number | null;
  usageCount: number;
  active: boolean;
  expiresAt?: string | null;
  createdAt: string;
};

export type SettingsDTO = {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  freeShippingThreshold: number;
  taxRate: number;
  shippingRates: { standard: number; express: number; sameday: number };
  paymentMethods: { cod: boolean; bkash: boolean; card: boolean; paypal: boolean };
  dealsEndAt?: string | null;
};

export type UserDTO = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  createdAt: string;
};

export type MessageDTO = {
  _id: string;
  name: string;
  email: string;
  orderNumber?: string;
  topic: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? {} : { data: T }))
  | { ok: false; error: string };
