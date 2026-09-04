import { appClient } from '@/src/utils/app-client';
import type { IListField } from '../models/ListField';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export const GET_LIST_FIELDS_KEY = ['get-list-fields'];

export function getListFieldsService({ signal }: QueryFnCtx) {
  return appClient.get<IListField[]>('/api/settings/fields', { signal });
}
