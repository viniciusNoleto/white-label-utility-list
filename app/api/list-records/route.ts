import { desc, count } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listRecords, listFields, objectFields } from '@/db/schema';
import { requireApiUser } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';
import { parseListRecordsFilters, buildListRecordsFilterCondition } from '@/libs/list-records-filter';

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

    const fields = await db.select().from(listFields);
    const objectFieldRows = await db.select().from(objectFields);

    for (const field of fields) {
      const value = (values as Record<string, any>)[field.key];

      if (field.type === 'object') {
        const requiredSubFields = objectFieldRows.filter(sub => sub.object_id === field.object_id && sub.required);

        for (const subField of requiredSubFields) {
          const subValue = value?.[subField.key];

          if (subValue === undefined || subValue === null || String(subValue).trim() === '') {
            return jsonError(
              msg(`O campo "${subField.label}" é obrigatório em "${field.label}".`, `El campo "${subField.label}" es obligatorio en "${field.label}".`, `Field "${subField.label}" is required in "${field.label}".`),
              422,
            );
          }
        }
        continue;
      }

      if (!field.required) continue;

      if (value === undefined || value === null || String(value).trim() === '') {
        return jsonError(
          msg(`O campo "${field.label}" é obrigatório.`, `El campo "${field.label}" es obligatorio.`, `Field "${field.label}" is required.`),
          422,
        );
      }
    }

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
