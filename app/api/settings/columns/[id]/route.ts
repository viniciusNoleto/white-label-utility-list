import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listColumns } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    const patch: Record<string, any> = {};
    if (body.label !== undefined) patch.label = String(body.label).trim();
    if (body.position !== undefined) patch.position = Number(body.position);

    const [updated] = await db
      .update(listColumns)
      .set(patch)
      .where(eq(listColumns.id, Number(id)))
      .returning();

    if (!updated) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(updated, msg('Coluna atualizada com sucesso.', 'Columna actualizada con éxito.', 'Column updated successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id } = await params;

    const [deleted] = await db.delete(listColumns).where(eq(listColumns.id, Number(id))).returning();

    if (!deleted) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(null, msg('Coluna excluída com sucesso.', 'Columna eliminada con éxito.', 'Column deleted successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
