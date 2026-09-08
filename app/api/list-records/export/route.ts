import ExcelJS from 'exceljs';
import { desc } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listRecords, listColumns, listFields } from '@/db/schema';
import { requireApiUser } from '@/libs/auth/dal';
import { jsonError, MESSAGES } from '@/libs/api';
import { parseListRecordsFilters, buildListRecordsFilterCondition } from '@/libs/list-records-filter';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';

function formatCellValue(values: Record<string, any>, column: { field_key: string; sub_path: string | null }, fieldsByKey: Record<string, { type: string }>) {
  const raw = column.sub_path ? values[column.field_key]?.[column.sub_path] : values[column.field_key];

  if (raw === null || raw === undefined || raw === '') return '';

  const field = fieldsByKey[column.field_key];

  if (field?.type === EListFieldType.DATE && typeof raw === 'string') {
    const [year, month, day] = raw.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
  }

  return String(raw);
}

export async function GET(request: Request) {
  const { response } = await requireApiUser(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const applyFilters = searchParams.get('apply_filters') === 'true';
    const filters = applyFilters ? parseListRecordsFilters(searchParams) : [];
    const searchCondition = await buildListRecordsFilterCondition(filters);

    const [columns, fields, records] = await Promise.all([
      db.select().from(listColumns),
      db.select().from(listFields),
      db.select().from(listRecords).where(searchCondition).orderBy(desc(listRecords.created_at)),
    ]);

    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
    const fieldsByKey = Object.fromEntries(fields.map(field => [field.key, field]));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista');

    worksheet.addRow(sortedColumns.map(column => column.label));

    for (const record of records) {
      worksheet.addRow(sortedColumns.map(column => formatCellValue(record.values, column, fieldsByKey)));
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="lista-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError(MESSAGES.serverError, 500);
  }
}
