import { Schema, model, models, type Model } from 'mongoose';

type CounterDoc = { _id: string; seq: number };
const CounterSchema = new Schema<CounterDoc>({ _id: { type: String, required: true }, seq: { type: Number, default: 0 } });

export const Counter: Model<CounterDoc> = (models.Counter as Model<CounterDoc>) || model<CounterDoc>('Counter', CounterSchema);

/** Returns sequential, human-friendly order numbers like TN-20481. */
export async function nextOrderNumber() {
  const doc = await Counter.findOneAndUpdate({ _id: 'order' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `TN-${20480 + (doc?.seq ?? 1)}`;
}
