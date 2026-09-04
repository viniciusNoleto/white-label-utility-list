import { max } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listColumns } from '@/db/schema';
import { requireApiAdmin } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function GET() {
  const { response } = await requireApiAdmin();
  if (response) return response;

  try {
    const rows = await db.select().from(listColumns).orderBy(listColumns.position);
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
    const field_key = typeof body.field_key === 'string' ? body.field_key.trim() : '';
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const sub_path = typeof body.sub_path === 'string' && body.sub_path ? body.sub_path.trim() : null;

    if (!field_key || !label) return jsonError(MESSAGES.invalidPayload, 422);

    const [{ value: maxPosition }] = await db.select({ value: max(listColumns.position) }).from(listColumns);

    const [created] = await db.insert(listColumns).values({
      field_key,
      sub_path,
      label,
      position: (maxPosition ?? -1) + 1,
    }).returning();

    return jsonOk(created, msg('Coluna criada com sucesso.', 'Columna creada con éxito.', 'Column created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
