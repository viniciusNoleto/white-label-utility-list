import { appClient } from '@/src/utils/appClient';
import type { GetListRecordsServiceFilter } from './getListRecords';

export type ExportListRecordsServiceQuery = {
  filters?: GetListRecordsServiceFilter[];
  apply_filters?: boolean;
};

export function exportListRecordsService({ query }: { query?: ExportListRecordsServiceQuery }) {
  const params = new URLSearchParams();
  const filters = query?.apply_filters ? (query?.filters ?? []).filter(filter => filter.column_id && filter.value.trim()) : [];

  if (filters.length > 0) params.set('filters', JSON.stringify(filters));
  if (query?.apply_filters) params.set('apply_filters', 'true');

  const qs = params.toString();

  return appClient.blob(`/api/list-records/export${qs ? `?${qs}` : ''}`);
}
