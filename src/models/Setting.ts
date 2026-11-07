import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const SettingSchema = new Schema(
  {
    key: { type: String, default: 'store', unique: true },
    storeName: { type: String, default: 'TechNest' },
    tagline: { type: String, default: 'Smarter Gadgets. Better Life.' },
    supportEmail: { type: String, default: 'support@technest.com' },
    supportPhone: { type: String, default: '' },
    currency: { type: String, default: 'BDT' },
    freeShippingThreshold: { type: Number, default: 5000 },
    taxRate: { type: Number, default: 8 },
    shippingRates: {
      standard: { type: Number, default: 80 },
      express: { type: Number, default: 150 },
      sameday: { type: Number, default: 250 },
    },
    paymentMethods: {
      cod: { type: Boolean, default: true },
      bkash: { type: Boolean, default: true },
      card: { type: Boolean, default: false },
      paypal: { type: Boolean, default: false },
    },
    dealsEndAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type SettingDoc = InferSchemaType<typeof SettingSchema>;
export const Setting: Model<SettingDoc> = (models.Setting as Model<SettingDoc>) || model<SettingDoc>('Setting', SettingSchema);
