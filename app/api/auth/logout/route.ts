import { getBearerToken } from '@/libs/auth/dal';
import { validateAccessToken } from '@/libs/auth/accessToken';
import { revokeSessionByAccessTokenId, revokeRefreshToken } from '@/libs/auth/refreshToken';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

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
