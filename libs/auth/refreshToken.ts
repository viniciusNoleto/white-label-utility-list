import 'server-only';

import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { refreshTokens } from '@/db/schema';
import { createAccessToken, revokeAccessTokenById } from './accessToken';
import { generateOpaqueToken, hashToken, isExpired, REFRESH_TOKEN_TTL_MS } from './tokens';

export type IssuedSession = {
  userId: number;
  accessToken: string;
  refreshToken: string;
};

/** Login: emite um par access+refresh novo, iniciando uma família nova. */
export async function createSession(userId: number): Promise<IssuedSession> {
  const accessToken = await createAccessToken(userId);
  const refreshToken = generateOpaqueToken();

  await db.insert(refreshTokens).values({
    user_id: userId,
    access_token_id: accessToken.id,
    family_id: randomUUID(),
    token_hash: hashToken(refreshToken),
  });

  return { userId, accessToken: accessToken.token, refreshToken };
}

export type RotateResult =
  | { ok: true; userId: number; accessToken: string; refreshToken: string }
  | { ok: false; reason: 'not_found' | 'expired' | 'reused' };

/**
 * Rotaciona um refresh token — espelha admin.process_new_refresh_token do
 * eventure-api: a linha usada é revogada (`is_revoked = true`, nunca
 * deletada) e um novo par access+refresh é emitido na mesma família
 * (`family_id`).
 *
 * Se a linha apresentada já estiver `is_revoked`, é reuso de um refresh
 * token que já foi trocado por um mais novo — sinal de possível roubo — e
 * a família inteira é revogada (derruba qualquer sessão que ainda dependa
 * dela). Ver docs/auth/reference-backend-analysis.md.
 */
export async function rotateSession(refreshToken: string): Promise<RotateResult> {
  const [row] = await db.select().from(refreshTokens).where(eq(refreshTokens.token_hash, hashToken(refreshToken))).limit(1);

  if (!row) return { ok: false, reason: 'not_found' };

  if (row.is_revoked) {
    await db.update(refreshTokens).set({ is_revoked: true }).where(eq(refreshTokens.family_id, row.family_id));
    return { ok: false, reason: 'reused' };
  }

  if (isExpired(row.created_at, REFRESH_TOKEN_TTL_MS)) {
    await db.update(refreshTokens).set({ is_revoked: true }).where(eq(refreshTokens.id, row.id));
    return { ok: false, reason: 'expired' };
  }

  await db.update(refreshTokens).set({ is_revoked: true }).where(eq(refreshTokens.id, row.id));

  const newAccessToken = await createAccessToken(row.user_id);
  const newRefreshToken = generateOpaqueToken();

  await db.insert(refreshTokens).values({
    user_id: row.user_id,
    access_token_id: newAccessToken.id,
    family_id: row.family_id,
    token_hash: hashToken(newRefreshToken),
  });

  return { ok: true, userId: row.user_id, accessToken: newAccessToken.token, refreshToken: newRefreshToken };
}

/**
 * Usado por GET /api/auth/token: confirma que o refresh_token (lido do
 * cookie pelo chamador) ainda é válido e pertence ao mesmo access token já
 * validado — sem rotacionar nada, sem efeito colateral. Espelha o join por
 * `personal_access_token_id` em admin.get_user_by_token; a diferença é que
 * lá o valor em texto plano é lido direto do banco, aqui o cliente reenvia
 * o valor (guardamos só o hash) e a gente só confere.
 */
export async function isRefreshTokenActiveForAccessToken(accessTokenId: number, refreshToken: string): Promise<boolean> {
  const [row] = await db
    .select({ id: refreshTokens.id, access_token_id: refreshTokens.access_token_id, is_revoked: refreshTokens.is_revoked, created_at: refreshTokens.created_at })
    .from(refreshTokens)
    .where(eq(refreshTokens.token_hash, hashToken(refreshToken)))
    .limit(1);

  if (!row || row.is_revoked || row.access_token_id !== accessTokenId) return false;

  if (isExpired(row.created_at, REFRESH_TOKEN_TTL_MS)) {
    await db.update(refreshTokens).set({ is_revoked: true }).where(eq(refreshTokens.id, row.id));
    return false;
  }

  return true;
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await db.update(refreshTokens).set({ is_revoked: true }).where(eq(refreshTokens.token_hash, hashToken(refreshToken)));
}

/** Logout: revoga o access token e o(s) refresh token(s) emitidos com ele. */
export async function revokeSessionByAccessTokenId(accessTokenId: number): Promise<void> {
  await revokeAccessTokenById(accessTokenId);
  await db.update(refreshTokens).set({ is_revoked: true }).where(eq(refreshTokens.access_token_id, accessTokenId));
}

/** Usado por rejeição de cadastro (admin) — revoga todo refresh já emitido para o usuário. */
export async function revokeAllRefreshTokensForUser(userId: number): Promise<void> {
  await db.update(refreshTokens).set({ is_revoked: true }).where(eq(refreshTokens.user_id, userId));
}
