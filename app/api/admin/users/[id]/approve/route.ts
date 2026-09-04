import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { users } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;

    const [updated] = await db
      .update(users)
      .set({ status: 'approved', updated_at: new Date() })
      .where(eq(users.id, Number(id)))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status });

    if (!updated) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(updated, msg('Usuário aprovado com sucesso.', 'Usuario aprobado con éxito.', 'User approved successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
