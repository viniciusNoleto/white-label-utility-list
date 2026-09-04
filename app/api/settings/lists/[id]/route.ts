import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { internalLists, listFields } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    const patch: Record<string, any> = {};
    if (body.name !== undefined) patch.name = String(body.name).trim();
    if (body.display_style !== undefined) patch.display_style = body.display_style === 'badge' ? 'badge' : 'text';

    const [updated] = await db
      .update(internalLists)
      .set(patch)
      .where(eq(internalLists.id, Number(id)))
      .returning();

    if (!updated) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(updated, msg('Lista atualizada com sucesso.', 'Lista actualizada con éxito.', 'List updated successfully.'));
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
    const listId = Number(id);

    const [usedByField] = await db.select({ id: listFields.id }).from(listFields).where(eq(listFields.internal_list_id, listId)).limit(1);
    if (usedByField) {
      return jsonError(
        msg('Esta lista está em uso por um campo e não pode ser excluída.', 'Esta lista está en uso por un campo y no puede eliminarse.', 'This list is in use by a field and cannot be deleted.'),
        409,
      );
    }

    const [deleted] = await db.delete(internalLists).where(eq(internalLists.id, listId)).returning();

    if (!deleted) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(null, msg('Lista excluída com sucesso.', 'Lista eliminada con éxito.', 'List deleted successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
