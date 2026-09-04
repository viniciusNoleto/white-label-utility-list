import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { users, sessions } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const userId = Number(id);

    const [updated] = await db
      .update(users)
      .set({ status: 'rejected', updated_at: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status });

    if (!updated) return jsonError(MESSAGES.notFound, 404);

    await db.delete(sessions).where(eq(sessions.user_id, userId));

    return jsonOk(updated, msg('Usuário rejeitado.', 'Usuario rechazado.', 'User rejected.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
