import { appClient } from '@/src/utils/app-client';
import type { IObject } from '../models/Object';
import type { PayloadBody } from '@/src/shared/types/api';

export type CreateObjectServicePayload = {
  key: string;
  name: string;
};

export function createObjectService({ body }: PayloadBody<CreateObjectServicePayload>) {
  return appClient.post<IObject>('/api/settings/objects', { body });
}
