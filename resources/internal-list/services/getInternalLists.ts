import { appClient } from '@/src/utils/app-client';
import type { IInternalList } from '../models/InternalList';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export const GET_INTERNAL_LISTS_KEY = ['get-internal-lists'];

export function getInternalListsService({ signal }: QueryFnCtx) {
  return appClient.get<IInternalList[]>('/api/settings/lists', { signal });
}
