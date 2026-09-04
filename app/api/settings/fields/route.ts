import { eq, max } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listFields } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

const VALID_TYPES = ['text', 'long_text', 'date', 'select', 'object', 'number'];

export async function GET() {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const rows = await db.select().from(listFields).orderBy(listFields.position);
    return jsonOk(rows, msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'));
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
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const type = body.type;

    if (!key || !label || !VALID_TYPES.includes(type)) {
      return jsonError(MESSAGES.invalidPayload, 422);
    }

    const [existing] = await db.select({ id: listFields.id }).from(listFields).where(eq(listFields.key, key)).limit(1);
    if (existing) {
      return jsonError(
        msg('Já existe um campo com essa chave.', 'Ya existe un campo con esa clave.', 'A field with this key already exists.'),
        409,
      );
    }

    const [{ value: maxPosition }] = await db.select({ value: max(listFields.position) }).from(listFields);

    const [created] = await db.insert(listFields).values({
      key,
      label,
      type,
      required: !!body.required,
      internal_list_id: type === 'select' ? (body.internal_list_id ?? null) : null,
      object_id: type === 'object' ? (body.object_id ?? null) : null,
      position: (maxPosition ?? -1) + 1,
    }).returning();

    return jsonOk(created, msg('Campo criado com sucesso.', 'Campo creado con éxito.', 'Field created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
