import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    brand: { type: String, default: '', index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    cost: { type: Number, default: null },
    images: [{ url: { type: String, required: true }, publicId: { type: String, default: '' } }],
    art: { type: String, default: 'accessories' },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
    sku: { type: String, default: '' },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active', index: true },
    featured: { type: Boolean, default: false },
    badge: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    specs: [{ key: String, value: String }],
    tags: [String],
  },
  { timestamps: true },
);

ProductSchema.index({ name: 'text', brand: 'text', tags: 'text' });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;
export const Product: Model<ProductDoc> = (models.Product as Model<ProductDoc>) || model<ProductDoc>('Product', ProductSchema);
