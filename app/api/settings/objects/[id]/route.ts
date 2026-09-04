import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { objects, listFields } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const objectId = Number(id);

    const [usedByField] = await db.select({ id: listFields.id }).from(listFields).where(eq(listFields.object_id, objectId)).limit(1);
    if (usedByField) {
      return jsonError(
        msg('Este objeto está em uso por um campo e não pode ser excluído.', 'Este objeto está en uso por un campo y no puede eliminarse.', 'This object is in use by a field and cannot be deleted.'),
        409,
      );
    }

    const [deleted] = await db.delete(objects).where(eq(objects.id, objectId)).returning();

    if (!deleted) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(null, msg('Objeto excluído com sucesso.', 'Objeto eliminado con éxito.', 'Object deleted successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
