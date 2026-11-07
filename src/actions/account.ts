'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { createSession, getSession } from '@/lib/auth';
import { User } from '@/models';
import type { FormState } from './auth';

const profileSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().max(30).optional().default(''),
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  country: z.string().optional().default(''),
});

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: 'Please sign in again.' };
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, phone, ...address } = parsed.data;

  await connectDB();
  await User.updateOne({ _id: session.id }, { name, phone, address });
  await createSession({ ...session, name });
  revalidatePath('/account');
  return { success: 'Profile saved.' };
}

const passwordSchema = z.object({
  current: z.string().min(1, 'Enter your current password'),
  next: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: 'Please sign in again.' };
  const parsed = passwordSchema.safeParse({ current: formData.get('current'), next: formData.get('next') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const user = await User.findById(session.id).select('+passwordHash');
  if (!user || !(await bcrypt.compare(parsed.data.current, user.passwordHash))) return { error: 'Current password is incorrect.' };
  user.passwordHash = await bcrypt.hash(parsed.data.next, 10);
  await user.save();
  return { success: 'Password updated.' };
}
