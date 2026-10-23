import { appClient } from '@/src/utils/appClient';
import type { IListRecord } from '../models/ListRecord';
import type { PaginatedResponse, PayloadQuery } from '@/src/shared/types/api';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export type GetListRecordsServiceFilter = {
  column_id: number;
  value: string;
};

export type GetListRecordsServiceQuery = {
  filters?: GetListRecordsServiceFilter[];
  page?: number;
  per_page?: number;
};

export const GET_LIST_RECORDS_KEY = ['get-list-records'];

export function getListRecordsService({ signal, query }: QueryFnCtx & PayloadQuery<GetListRecordsServiceQuery>) {
  const params = new URLSearchParams();
  const filters = (query?.filters ?? []).filter(filter => filter.column_id && filter.value.trim());

  if (filters.length > 0) params.set('filters', JSON.stringify(filters));
  if (query?.page) params.set('page', String(query.page));
  if (query?.per_page) params.set('per_page', String(query.per_page));

  const qs = params.toString();

  return appClient.get<PaginatedResponse<IListRecord>>(`/api/list-records${qs ? `?${qs}` : ''}`, { signal });
}
