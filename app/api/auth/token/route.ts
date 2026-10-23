import { cookies } from 'next/headers';
import { getBearerToken, getApprovedUser } from '@/libs/auth/dal';
import { validateAccessToken } from '@/libs/auth/accessToken';
import { isRefreshTokenActiveForAccessToken } from '@/libs/auth/refreshToken';
import { REFRESH_TOKEN_COOKIE } from '@/libs/auth/tokens';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  const valid = await validateAccessToken(accessToken);
  if (!valid) return jsonError(MESSAGES.unauthorized, 401);

  const user = await getApprovedUser(valid.userId);
  if (!user) return jsonError(MESSAGES.unauthorized, 401);

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
  if (!refreshToken) return jsonError(MESSAGES.unauthorized, 401);

  const refreshIsActive = await isRefreshTokenActiveForAccessToken(valid.id, refreshToken);
  if (!refreshIsActive) return jsonError(MESSAGES.unauthorized, 401);

  return jsonOk(
    { user, access_token: accessToken, refresh_token: refreshToken },
    msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'),
  );
}
