import { randomBytes, createHash } from 'crypto';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Validade calculada a cada request como tempo decorrido desde
// `created_at` (ver accessToken.ts/refreshToken.ts) — não é um TTL
// embutido no token, espelha AuthenticateMiddleware do eventure-api. Ver
// docs/auth/reference-backend-analysis.md.
export const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 2; // 2 minutos
export const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias (~1 mês)

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isExpired(createdAt: Date, ttlMs: number): boolean {
  return Date.now() - createdAt.getTime() >= ttlMs;
}
