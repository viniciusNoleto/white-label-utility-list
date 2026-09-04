import { eq, max } from 'drizzle-orm';
import { db } from '@/libs/db';
import { internalListItems } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;
    const listId = Number(id);
    const body = await request.json();
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const color = typeof body.color === 'string' ? body.color : null;

    if (!label) return jsonError(MESSAGES.invalidPayload, 422);

    const [{ value: maxPosition }] = await db
      .select({ value: max(internalListItems.position) })
      .from(internalListItems)
      .where(eq(internalListItems.list_id, listId));

    const [created] = await db.insert(internalListItems).values({
      list_id: listId,
      label,
      color,
      position: (maxPosition ?? -1) + 1,
    }).returning();

    return jsonOk(created, msg('Item adicionado com sucesso.', 'Elemento agregado con éxito.', 'Item added successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
