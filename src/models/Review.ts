import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
  },
  { timestamps: true },
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema>;
export const Review: Model<ReviewDoc> = (models.Review as Model<ReviewDoc>) || model<ReviewDoc>('Review', ReviewSchema);
