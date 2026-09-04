import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { users } from '@/db/schema';
import { validateAccessToken } from './accessToken';
import { ACCESS_TOKEN_COOKIE } from './tokens';
import { jsonError, MESSAGES } from '@/libs/api';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

export async function getApprovedUser(userId: number): Promise<AuthUser | null> {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row || row.status !== 'approved') return null;

  return row;
}

/**
 * Real (non-optimistic) auth check — hits the DB so a revoked/rejected
 * account (or a revoked access token) loses access immediately, not just
 * after its access token expires.
 */
export async function getCurrentUserFromAccessToken(accessToken: string | null): Promise<AuthUser | null> {
  const valid = await validateAccessToken(accessToken);
  if (!valid) return null;

  return getApprovedUser(valid.userId);
}

export type RotatedSession = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
};

/**
 * A partir do retorno de `rotateSession` (libs/auth/refreshToken.ts), monta
 * o payload padrão `{ user, access_token, refresh_token }` devolvido por
 * POST /api/auth/token/refresh — busca o usuário atualizado (pega
 * mudanças de role/status feitas depois do login).
 */
export async function buildSessionResponse(rotated: { userId: number; accessToken: string; refreshToken: string }): Promise<RotatedSession | null> {
  const user = await getApprovedUser(rotated.userId);
  if (!user) return null;

  return { user, access_token: rotated.accessToken, refresh_token: rotated.refreshToken };
}

/** Use in Server Components — never redirects, just tells you who's logged in (or null). */
export const getSessionFromCookie = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  return getCurrentUserFromAccessToken(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null);
});

/** Use in Server Components/layouts/pages — redirects when unauthenticated. */
export async function verifySession(): Promise<AuthUser> {
  const session = await getSessionFromCookie();
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
export async function requireApiUser(request: Request) {
  const user = await getCurrentUserFromAccessToken(getBearerToken(request));
  if (!user) return { user: null, response: jsonError(MESSAGES.unauthorized, 401) };
  return { user, response: null };
}

/** Use in Route Handlers — returns a 401/403 JSON response instead of redirecting. */
export async function requireApiAdmin(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return { user: null, response };
  if (user.role !== 'admin') return { user: null, response: jsonError(MESSAGES.forbidden, 403) };
  return { user, response: null };
}
