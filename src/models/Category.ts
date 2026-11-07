import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    art: { type: String, default: 'accessories' },
    image: { url: String, publicId: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const Category: Model<CategoryDoc> = (models.Category as Model<CategoryDoc>) || model<CategoryDoc>('Category', CategorySchema);
