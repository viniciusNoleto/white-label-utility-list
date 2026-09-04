import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/libs/db';
import { sessions, users } from '@/db/schema';
import { decryptSessionToken, SESSION_COOKIE } from './jwt';
import { hashToken } from './session';
import { jsonError, MESSAGES } from '@/libs/api';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

/**
 * Real (non-optimistic) session check — hits the DB so a revoked/rejected
 * account loses access immediately, not just after its JWT expires.
 */
export const getSession = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await decryptSessionToken(raw);

  if (!payload?.token) return null;

  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(and(eq(sessions.token_hash, hashToken(payload.token)), gt(sessions.expires_at, new Date())))
    .limit(1);

  if (!row || row.status !== 'approved') return null;

  return row;
});

/** Use in Server Components/layouts/pages — redirects when unauthenticated. */
export async function verifySession(): Promise<AuthUser> {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  return session;
}

/** Use in Server Components/layouts/pages — redirects non-admins to the main list. */
export async function requireAdmin(): Promise<AuthUser> {
  const session = await verifySession();
  if (session.role !== 'admin') redirect('/list');
  return session;
}

/** Use in Route Handlers — returns a 401 JSON response instead of redirecting. */
export async function requireApiUser() {
  const user = await getSession();
  if (!user) return { user: null, response: jsonError(MESSAGES.unauthorized, 401) };
  return { user, response: null };
}

/** Use in Route Handlers — returns a 401/403 JSON response instead of redirecting. */
export async function requireApiAdmin() {
  const { user, response } = await requireApiUser();
  if (response) return { user: null, response };
  if (user.role !== 'admin') return { user: null, response: jsonError(MESSAGES.forbidden, 403) };
  return { user, response: null };
}
