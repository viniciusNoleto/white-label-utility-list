import { appClient } from '@/src/utils/app-client';
import type { PayloadQuery } from '@/src/shared/types/api';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';
import type { GetListRecordsServiceFilter } from './getListRecords';

export type GetListRecordsExportEstimateServiceQuery = {
  filters?: GetListRecordsServiceFilter[];
  apply_filters?: boolean;
};

export interface IListRecordsExportEstimate {
  row_count: number;
  column_count: number;
  estimated_bytes: number;
}

export const GET_LIST_RECORDS_EXPORT_ESTIMATE_KEY = ['get-list-records-export-estimate'];

export function getListRecordsExportEstimateService({ signal, query }: QueryFnCtx & PayloadQuery<GetListRecordsExportEstimateServiceQuery>) {
  const params = new URLSearchParams();
  const filters = query?.apply_filters ? (query?.filters ?? []).filter(filter => filter.column_id && filter.value.trim()) : [];

  if (filters.length > 0) params.set('filters', JSON.stringify(filters));
  if (query?.apply_filters) params.set('apply_filters', 'true');

  const qs = params.toString();

  return appClient.get<IListRecordsExportEstimate>(`/api/list-records/export-estimate${qs ? `?${qs}` : ''}`, { signal });
}
