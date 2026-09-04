import { getBearerToken } from '@/libs/auth/dal';
import { validateAccessToken } from '@/libs/auth/accessToken';
import { revokeSessionByAccessTokenId, revokeRefreshToken } from '@/libs/auth/refreshToken';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

// Espelha LogoutService do eventure-api: acha o access token pelo
// Authorization (já enviado em toda chamada de utils/app-client.ts) e
// revoga ele + o(s) refresh token(s) emitidos com ele — invalidação real
// no banco, não só limpeza de cookie no client. O `refresh_token` do body
// é um fallback best-effort (cobre o caso raro do access token já ter
// expirado/sido revogado antes do logout ser clicado).
export async function POST(request: Request) {
  try {
    const valid = await validateAccessToken(getBearerToken(request));
    if (valid) await revokeSessionByAccessTokenId(valid.id);

    const body = await request.json().catch(() => ({}));
    const refreshToken = typeof body?.refresh_token === 'string' ? body.refresh_token : null;
    if (refreshToken) await revokeRefreshToken(refreshToken);

    return jsonOk(null, msg('Sessão encerrada.', 'Sesión cerrada.', 'Signed out.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
