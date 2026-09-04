import { appClient } from '@/src/utils/app-client';
import type { IObject } from '../models/Object';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export const GET_OBJECTS_KEY = ['get-objects'];

export function getObjectsService({ signal }: QueryFnCtx) {
  return appClient.get<IObject[]>('/api/settings/objects', { signal });
}
