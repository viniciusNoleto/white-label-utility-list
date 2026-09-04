import { appClient } from '@/src/utils/app-client';
import type { IListColumn } from '../models/ListColumn';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export const GET_LIST_COLUMNS_KEY = ['get-list-columns'];

export function getListColumnsService({ signal }: QueryFnCtx) {
  return appClient.get<IListColumn[]>('/api/settings/columns', { signal });
}
