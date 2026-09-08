import { and, inArray, sql } from 'drizzle-orm';
import { db } from '@/libs/db';
import { listColumns, listRecords } from '@/db/schema';

export type ListRecordsFilter = {
  column_id: number;
  value: string;
};

export function parseListRecordsFilters(searchParams: URLSearchParams): ListRecordsFilter[] {
  try {
    const parsed = JSON.parse(searchParams.get('filters') ?? '[]');

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((filter): filter is ListRecordsFilter => !!filter?.column_id && typeof filter?.value === 'string' && filter.value.trim() !== '');
  } catch {
    return [];
  }
}

export async function buildListRecordsFilterCondition(filters: ListRecordsFilter[]) {
  if (filters.length === 0) return undefined;

  const columnRows = await db.select().from(listColumns).where(inArray(listColumns.id, filters.map(filter => filter.column_id)));
  const columnsById = Object.fromEntries(columnRows.map(column => [column.id, column]));

  const conditions = filters
    .map((filter) => {
      const column = columnsById[filter.column_id];
      if (!column) return null;

      const likeValue = `%${filter.value.trim()}%`;

      return column.sub_path
        ? sql`${listRecords.values} -> ${column.field_key} ->> ${column.sub_path} ILIKE ${likeValue}`
        : sql`${listRecords.values} ->> ${column.field_key} ILIKE ${likeValue}`;
    })
    .filter(condition => condition !== null);

  return conditions.length > 0 ? and(...conditions) : undefined;
}
