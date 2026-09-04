import { eq, asc } from 'drizzle-orm';
import { db } from '@/libs/db';
import { internalLists, internalListItems } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function GET() {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const lists = await db.select().from(internalLists).orderBy(internalLists.name);
    const items = await db.select().from(internalListItems).orderBy(asc(internalListItems.position));

    const data = lists.map(list => ({
      ...list,
      items: items.filter(item => item.list_id === list.id),
    }));

    return jsonOk(data, msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}

export async function POST(request: Request) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const display_style = body.display_style === 'badge' ? 'badge' : 'text';

    if (!key || !name) return jsonError(MESSAGES.invalidPayload, 422);

    const [existing] = await db.select({ id: internalLists.id }).from(internalLists).where(eq(internalLists.key, key)).limit(1);
    if (existing) {
      return jsonError(
        msg('Já existe uma lista com essa chave.', 'Ya existe una lista con esa clave.', 'A list with this key already exists.'),
        409,
      );
    }

    const [created] = await db.insert(internalLists).values({ key, name, display_style }).returning();

    return jsonOk({ ...created, items: [] }, msg('Lista criada com sucesso.', 'Lista creada con éxito.', 'List created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
