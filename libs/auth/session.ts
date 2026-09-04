import 'server-only';

import { randomBytes, createHash } from 'crypto';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { sessions } from '@/db/schema';
import { encryptSessionToken, decryptSessionToken, SESSION_COOKIE } from './jwt';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: number, role: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });

  const jwt = await encryptSessionToken({ token, user_id: userId, role }, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await decryptSessionToken(raw);

  if (payload?.token) {
    await db.delete(sessions).where(eq(sessions.token_hash, hashToken(payload.token)));
  }

  cookieStore.delete(SESSION_COOKIE);
}
