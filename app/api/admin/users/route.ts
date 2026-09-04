import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { users } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function GET(request: Request) {
  const { response } = await requireApiAdmin(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const columns = {
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      created_at: users.created_at,
      updated_at: users.updated_at,
    };

    const rows = status && ['pending', 'approved', 'rejected'].includes(status)
      ? await db.select(columns).from(users).where(eq(users.status, status)).orderBy(users.created_at)
      : await db.select(columns).from(users).orderBy(users.created_at);

    return jsonOk(rows, msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
