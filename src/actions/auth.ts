'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { createSession, destroySession } from '@/lib/auth';
import { User } from '@/models';

export type FormState = { error?: string; success?: string } | undefined;

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const n = typeof next === 'string' ? next : '';
  return n.startsWith('/') && !n.startsWith('//') ? n : fallback;
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: 'Incorrect email or password.' };
  }
  await createSession({ id: String(user._id), name: user.name, email: user.email, role: user.role === 'admin' ? 'admin' : 'customer' });
  redirect(safeNext(formData.get('next'), user.role === 'admin' ? '/admin' : '/account'));
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({ name: formData.get('name'), email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const email = parsed.data.email.toLowerCase();
  if (await User.exists({ email })) return { error: 'An account with this email already exists.' };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({ name: parsed.data.name, email, passwordHash, role: 'customer' });
  await createSession({ id: String(user._id), name: user.name, email: user.email, role: 'customer' });
  redirect(safeNext(formData.get('next'), '/account'));
}

export async function adminLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select('+passwordHash');
  if (!user || user.role !== 'admin' || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: 'Invalid admin credentials.' };
  }
  await createSession({ id: String(user._id), name: user.name, email: user.email, role: 'admin' });
  redirect('/admin');
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}

export async function adminLogoutAction() {
  await destroySession();
  redirect('/admin/login');
}
