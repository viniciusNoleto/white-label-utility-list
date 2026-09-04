import { buildSessionResponse } from '@/libs/auth/dal';
import { rotateSession } from '@/libs/auth/refreshToken';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const refreshToken = typeof body?.refresh_token === 'string' ? body.refresh_token : '';

    if (!refreshToken) return jsonError(MESSAGES.unauthorized, 401);

    const rotated = await rotateSession(refreshToken);
    if (!rotated.ok) return jsonError(MESSAGES.unauthorized, 401);

    const session = await buildSessionResponse(rotated);
    if (!session) return jsonError(MESSAGES.unauthorized, 401);

    return jsonOk(
      session,
      msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'),
    );
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
