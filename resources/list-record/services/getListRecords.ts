import { appClient } from '@/src/utils/app-client';
import type { IListRecord } from '../models/ListRecord';
import type { PaginatedResponse, PayloadQuery } from '@/src/shared/types/api';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export type GetListRecordsServiceQuery = {
  column_id?: number;
  value?: string;
  page?: number;
  per_page?: number;
};

export const GET_LIST_RECORDS_KEY = ['get-list-records'];

export function getListRecordsService({ signal, query }: QueryFnCtx & PayloadQuery<GetListRecordsServiceQuery>) {
  const params = new URLSearchParams();
  if (query?.column_id) params.set('column_id', String(query.column_id));
  if (query?.value) params.set('value', query.value);
  if (query?.page) params.set('page', String(query.page));
  if (query?.per_page) params.set('per_page', String(query.per_page));

  const qs = params.toString();

  return appClient.get<PaginatedResponse<IListRecord>>(`/api/list-records${qs ? `?${qs}` : ''}`, { signal });
}
