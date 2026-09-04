import { cookies } from 'next/headers';
import { getBearerToken, getApprovedUser } from '@/libs/auth/dal';
import { validateAccessToken } from '@/libs/auth/accessToken';
import { isRefreshTokenActiveForAccessToken } from '@/libs/auth/refreshToken';
import { REFRESH_TOKEN_COOKIE } from '@/libs/auth/tokens';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

// Recebe o access_token em Authorization. Se ele for válido, devolve o
// formato padrão de auth — { user, access_token, refresh_token } — igual
// ao de login/token/refresh. Espelha admin.get_user_by_token do
// eventure-api (ver docs/auth/reference-backend-analysis.md): é uma
// LEITURA pura, sem efeitos colaterais — nenhum token é rotacionado ou
// revogado aqui, o par devolvido é idêntico ao que já existia.
//
// O refresh_token vem do cookie (enviado automaticamente pelo browser em
// requests same-origin), não é reenviado pelo cliente explicitamente: o
// servidor só confere que ele ainda está ativo e ligado a este mesmo
// access token (via access_token_id) e o devolve sem alterar nada — nunca
// "lembra" o valor a partir do banco, porque só o hash fica guardado (ver
// desvio documentado em reference-backend-analysis.md).
//
// Se o access_token for inválido/expirado, esta rota só retorna 401 — não
// tenta renovar sozinha. Quem chama (SSR via proxy.ts, ou o client via
// utils/app-client.ts) é responsável por, nesse caso, seguir o processo
// padrão de tentar POST /api/auth/token/refresh.
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
