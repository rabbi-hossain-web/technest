'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { assertAdmin } from '@/lib/auth';
import { Message } from '@/models';
import type { FormState } from './auth';

const messageSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  orderNumber: z.string().optional().default(''),
  topic: z.string().default('Other'),
  message: z.string().min(10, 'Message should be at least 10 characters').max(3000),
});

export async function sendMessageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await connectDB();
  await Message.create(parsed.data);
  revalidatePath('/admin/messages');
  return { success: 'Message sent — we’ll get back to you within 24 hours.' };
}

export async function setMessageReadAction(id: string, read: boolean) {
  await assertAdmin();
  await connectDB();
  await Message.updateOne({ _id: id }, { read });
  revalidatePath('/admin/messages');
  return { ok: true as const };
}

export async function deleteMessageAction(id: string) {
  await assertAdmin();
  await connectDB();
  await Message.deleteOne({ _id: id });
  revalidatePath('/admin/messages');
  return { ok: true as const };
}
