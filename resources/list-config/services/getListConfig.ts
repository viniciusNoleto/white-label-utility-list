import { appClient } from '@/src/utils/app-client';
import type { IListConfig } from '../models/ListConfig';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export const GET_LIST_CONFIG_KEY = ['get-list-config'];

export function getListConfigService({ signal }: QueryFnCtx) {
  return appClient.get<IListConfig>('/api/list-config', { signal });
}
