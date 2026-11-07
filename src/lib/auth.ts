import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SessionUser } from '@/types';
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from './session';

export async function createSession(user: SessionUser) {
  const token = await signSession(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireUser(next = '/account') {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/admin/login');
  return session;
}

/** For server actions: throws instead of redirecting. */
export async function assertAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') throw new Error('Not authorized');
  return session;
}
