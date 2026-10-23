import { appClient } from '@/src/utils/appClient';
import type { IObject } from '../models/Object';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';

export const GET_OBJECTS_KEY = ['get-objects'];

export function getObjectsService({ signal }: QueryFnCtx) {
  return appClient.get<IObject[]>('/api/settings/objects', { signal });
}
