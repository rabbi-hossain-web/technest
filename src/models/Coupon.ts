import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type CouponDoc = InferSchemaType<typeof CouponSchema>;
export const Coupon: Model<CouponDoc> = (models.Coupon as Model<CouponDoc>) || model<CouponDoc>('Coupon', CouponSchema);
