import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, default: '' },
    shippingAddress: {
      firstName: String,
      lastName: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        slug: String,
        image: String,
        art: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number,
    couponCode: { type: String, default: '' },
    shippingMethod: { type: String, enum: ['standard', 'express', 'sameday'], default: 'standard' },
    paymentMethod: { type: String, enum: ['cod', 'bkash', 'card', 'paypal'], default: 'cod' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending', index: true },
    courier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    timeline: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true },
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;
export const Order: Model<OrderDoc> = (models.Order as Model<OrderDoc>) || model<OrderDoc>('Order', OrderSchema);
