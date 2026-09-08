import { count } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listRecords, listColumns } from '@/db/schema';
import { requireApiUser } from '@/libs/auth/dal';
import { jsonOk, jsonError, msg, MESSAGES } from '@/libs/api';
import { parseListRecordsFilters, buildListRecordsFilterCondition } from '@/libs/list-records-filter';

const ESTIMATED_BYTES_PER_CELL = 12;
const ESTIMATED_OVERHEAD_BYTES = 4096;

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const applyFilters = searchParams.get('apply_filters') === 'true';
    const filters = applyFilters ? parseListRecordsFilters(searchParams) : [];
    const searchCondition = await buildListRecordsFilterCondition(filters);

    const [{ value: rowCount }, columnCount] = await Promise.all([
      db.select({ value: count() }).from(listRecords).where(searchCondition).then(rows => rows[0]),
      db.select({ value: count() }).from(listColumns).then(rows => rows[0].value),
    ]);

    const estimatedBytes = ESTIMATED_OVERHEAD_BYTES + (rowCount + 1) * columnCount * ESTIMATED_BYTES_PER_CELL;

    return jsonOk(
      { row_count: rowCount, column_count: columnCount, estimated_bytes: estimatedBytes },
      msg('Operação realizada com sucesso.', 'Operación realizada con éxito.', 'Operation completed successfully.'),
    );
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
