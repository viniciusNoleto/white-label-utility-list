import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { internalListItems } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id, itemId } = await params;
    const body = await request.json();

    const patch: Record<string, any> = {};
    if (body.label !== undefined) patch.label = String(body.label).trim();
    if (body.position !== undefined) patch.position = Number(body.position);
    if (body.color !== undefined) patch.color = body.color ? String(body.color) : null;

    const [updated] = await db
      .update(internalListItems)
      .set(patch)
      .where(and(eq(internalListItems.id, Number(itemId)), eq(internalListItems.list_id, Number(id))))
      .returning();

    if (!updated) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(updated, msg('Item atualizado com sucesso.', 'Elemento actualizado con éxito.', 'Item updated successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const { id, itemId } = await params;

    const [deleted] = await db
      .delete(internalListItems)
      .where(and(eq(internalListItems.id, Number(itemId)), eq(internalListItems.list_id, Number(id))))
      .returning();

    if (!deleted) return jsonError(MESSAGES.notFound, 404);

    return jsonOk(null, msg('Item removido com sucesso.', 'Elemento eliminado con éxito.', 'Item removed successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
