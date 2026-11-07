// Edge-safe JWT helpers (used by middleware and server code).
import { SignJWT, jwtVerify } from 'jose';
import type { SessionUser } from '@/types';

export const SESSION_COOKIE = 'tn_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.id || !payload.email) return null;
    return { id: String(payload.id), name: String(payload.name), email: String(payload.email), role: payload.role === 'admin' ? 'admin' : 'customer' };
  } catch {
    return null;
  }
}
