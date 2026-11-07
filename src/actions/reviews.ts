'use server';

import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Product, Review } from '@/models';
import type { FormState } from './auth';

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  title: z.string().min(2, 'Add a short title').max(120),
  body: z.string().min(10, 'Tell us a bit more (10+ characters)').max(2000),
});

export async function addReviewAction(productId: string, slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: 'Please sign in to write a review.' };
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  try {
    await Review.findOneAndUpdate(
      { product: productId, user: session.id },
      { ...parsed.data, name: session.name },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch {
    return { error: 'Could not save your review. Please try again.' };
  }
  const [agg] = await Review.aggregate<{ avg: number; n: number }>([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await Product.updateOne({ _id: productId }, { rating: Math.round((agg?.avg ?? 0) * 10) / 10, numReviews: agg?.n ?? 0 });
  revalidatePath(`/product/${slug}`);
  return { success: 'Thanks! Your review is live.' };
}
