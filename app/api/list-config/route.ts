import { asc } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listFields, listColumns, internalLists, internalListItems, objects, objectFields } from '@/db/schema';
import { requireApiUser } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);
  if (response) return response;

  try {
    const [fields, columns, lists, items, objectRows, objectFieldRows] = await Promise.all([
      db.select().from(listFields).orderBy(asc(listFields.position)),
      db.select().from(listColumns).orderBy(asc(listColumns.position)),
      db.select().from(internalLists).orderBy(internalLists.name),
      db.select().from(internalListItems).orderBy(asc(internalListItems.position)),
      db.select().from(objects).orderBy(objects.name),
      db.select().from(objectFields).orderBy(asc(objectFields.position)),
    ]);

    const data = {
      fields,
      columns,
      internal_lists: lists.map(list => ({
        ...list,
        items: items.filter(item => item.list_id === list.id),
      })),
      objects: objectRows.map(object => ({
        ...object,
        fields: objectFieldRows.filter(field => field.object_id === object.id),
      })),
    };

    return jsonOk(data, msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'));
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
