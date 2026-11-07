import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const MessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    orderNumber: { type: String, default: '' },
    topic: { type: String, default: 'Other' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type MessageDoc = InferSchemaType<typeof MessageSchema>;
export const Message: Model<MessageDoc> = (models.Message as Model<MessageDoc>) || model<MessageDoc>('Message', MessageSchema);
