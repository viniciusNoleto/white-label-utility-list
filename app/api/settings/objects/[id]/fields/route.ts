import { eq, max } from 'drizzle-orm';
import { db } from '@/libs/db';
import { objectFields } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

const VALID_TYPES = ['text', 'long_text', 'date', 'select', 'number'];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin(request);
  if (response) return response;

  try {
    const { id } = await params;
    const objectId = Number(id);
    const body = await request.json();
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const type = body.type;

    if (!key || !label || !VALID_TYPES.includes(type)) {
      return jsonError(MESSAGES.invalidPayload, 422);
    }

    const [{ value: maxPosition }] = await db
      .select({ value: max(objectFields.position) })
      .from(objectFields)
      .where(eq(objectFields.object_id, objectId));

    const [created] = await db.insert(objectFields).values({
      object_id: objectId,
      key,
      label,
      type,
      required: !!body.required,
      internal_list_id: type === 'select' ? (body.internal_list_id ?? null) : null,
      position: (maxPosition ?? -1) + 1,
    }).returning();

    return jsonOk(created, msg('Campo criado com sucesso.', 'Campo creado con éxito.', 'Field created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
