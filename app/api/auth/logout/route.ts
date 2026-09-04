import { deleteSession } from '@/libs/auth/session';
import { jsonOk, msg } from '@/libs/api';

export async function POST() {
  await deleteSession();

  return jsonOk(null, msg('Sessão encerrada.', 'Sesión cerrada.', 'Signed out.'));
}
