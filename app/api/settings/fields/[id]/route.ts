import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listFields } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

const VALID_TYPES = ['text', 'long_text', 'date', 'select', 'object', 'number'];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();

    const patch: Record<string, any> = {};

    if (body.label !== undefined) patch.label = String(body.label).trim();
    if (body.required !== undefined) patch.required = !!body.required;
    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type)) return jsonError(MESSAGES.invalidPayload, 422);
      patch.type = body.type;
    }
    if (body.internal_list_id !== undefined) patch.internal_list_id = body.internal_list_id;
    if (body.object_id !== undefined) patch.object_id = body.object_id;
    if (body.position !== undefined) patch.position = Number(body.position);

    const [updated] = await db
      .update(listFields)
      .set(patch)
      .where(eq(listFields.id, Number(id)))
      .returning();

    if (!updated) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(updated, msg('Campo atualizado com sucesso.', 'Campo actualizado con éxito.', 'Field updated successfully.'));
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

    const [deleted] = await db.delete(listFields).where(eq(listFields.id, Number(id))).returning();

    if (!deleted) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(null, msg('Campo excluído com sucesso.', 'Campo eliminado con éxito.', 'Field deleted successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
