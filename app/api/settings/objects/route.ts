import { eq, asc } from 'drizzle-orm';
import { db } from '@/libs/db';
import { objects, objectFields } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function GET() {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const rows = await db.select().from(objects).orderBy(objects.name);
    const fields = await db.select().from(objectFields).orderBy(asc(objectFields.position));

    const data = rows.map(object => ({
      ...object,
      fields: fields.filter(field => field.object_id === object.id),
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

    if (!key || !name) return jsonError(MESSAGES.invalidPayload, 422);

    const [existing] = await db.select({ id: objects.id }).from(objects).where(eq(objects.key, key)).limit(1);
    if (existing) {
      return jsonError(
        msg('Já existe um objeto com essa chave.', 'Ya existe un objeto con esa clave.', 'An object with this key already exists.'),
        409,
      );
    }

    const [created] = await db.insert(objects).values({ key, name }).returning();

    return jsonOk({ ...created, fields: [] }, msg('Objeto criado com sucesso.', 'Objeto creado con éxito.', 'Object created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
