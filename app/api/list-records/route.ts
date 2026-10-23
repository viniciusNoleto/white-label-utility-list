import { desc, count } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listRecords } from '@/db/schema';
import { requireApiUser } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';
import { parseListRecordsFilters, buildListRecordsFilterCondition } from '@/libs/list-records-filter';
import { validateListRecordValues } from '@/libs/list-records-validation';

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const perPage = Math.max(1, Number(searchParams.get('per_page')) || 15);

    const filters = parseListRecordsFilters(searchParams);
    const searchCondition = await buildListRecordsFilterCondition(filters);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(listRecords)
      .where(searchCondition);

    const items = await db
      .select()
      .from(listRecords)
      .where(searchCondition)
      .orderBy(desc(listRecords.created_at))
      .limit(perPage)
      .offset((page - 1) * perPage);

    return jsonOk(
      {
        items,
        meta: {
          page,
          per_page: perPage,
          total,
          last_page: Math.max(1, Math.ceil(total / perPage)),
        },
      },
      msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'),
    );
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return response;

  try {
    const body = await request.json();
    const values = body.values;

    if (!values || typeof values !== 'object') return jsonError(MESSAGES.invalidPayload, 422);

    const validationError = await validateListRecordValues(values);
    if (validationError) return jsonError(validationError, 422);

    const [created] = await db.insert(listRecords).values({
      values,
      created_by: user!.id,
    }).returning();

    return jsonOk(created, msg('Registro criado com sucesso.', 'Registro creado con éxito.', 'Record created successfully.'), 201);
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
