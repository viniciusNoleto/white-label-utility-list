import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listRecords } from '@/db/schema';
import { requireApiUser } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiUser(request);
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const values = body.values;

    if (!values || typeof values !== 'object') return jsonError(MESSAGES.invalidPayload, 422);

    const [updated] = await db
      .update(listRecords)
      .set({ values, updated_at: new Date() })
      .where(eq(listRecords.id, Number(id)))
      .returning();

    if (!updated) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(updated, msg('Registro atualizado com sucesso.', 'Registro actualizado con éxito.', 'Record updated successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiUser(request);
  if (response) return response;

  try {
    const { id } = await params;

    const [deleted] = await db.delete(listRecords).where(eq(listRecords.id, Number(id))).returning();

    if (!deleted) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(null, msg('Registro excluído com sucesso.', 'Registro eliminado con éxito.', 'Record deleted successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
