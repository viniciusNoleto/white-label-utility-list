import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { accessTokens } from '@/db/schema';
import { generateOpaqueToken, hashToken, isExpired, ACCESS_TOKEN_TTL_MS } from './tokens';

export async function createAccessToken(userId: number): Promise<{ id: number; token: string }> {
  const token = generateOpaqueToken();

  const [row] = await db
    .insert(accessTokens)
    .values({ user_id: userId, token_hash: hashToken(token) })
    .returning({ id: accessTokens.id });

  return { id: row.id, token };
}

export type ValidAccessToken = { id: number; userId: number };

/**
 * Valida um access token (hash -> banco). Espelha
 * AuthenticateMiddleware::checkIfTokenIsValid do eventure-api: se o tempo
 * decorrido desde `created_at` já passou do TTL, revoga a linha nesse
 * mesmo momento (não deixa só expirar passivamente) e devolve null.
 */
export async function validateAccessToken(token: string | null): Promise<ValidAccessToken | null> {
  if (!token) return null;

  const [row] = await db.select().from(accessTokens).where(eq(accessTokens.token_hash, hashToken(token))).limit(1);

  if (!row || row.is_revoked) return null;

  if (isExpired(row.created_at, ACCESS_TOKEN_TTL_MS)) {
    await db.update(accessTokens).set({ is_revoked: true }).where(eq(accessTokens.id, row.id));
    return null;
  }

  return { id: row.id, userId: row.user_id };
}

export async function revokeAccessTokenById(id: number): Promise<void> {
  await db.update(accessTokens).set({ is_revoked: true }).where(eq(accessTokens.id, id));
}

/** Usado por rejeição de cadastro (admin) — revoga todo acesso já emitido para o usuário. */
export async function revokeAllAccessTokensForUser(userId: number): Promise<void> {
  await db.update(accessTokens).set({ is_revoked: true }).where(eq(accessTokens.user_id, userId));
}
