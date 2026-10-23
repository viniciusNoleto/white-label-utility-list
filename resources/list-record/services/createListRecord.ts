import { appClient } from '@/src/utils/appClient';
import type { IListRecord } from '../models/ListRecord';
import type { PayloadBody } from '@/src/shared/types/api';

export type CreateListRecordServicePayload = {
  values: Record<string, any>;
};

export function createListRecordService({ body }: PayloadBody<CreateListRecordServicePayload>) {
  return appClient.post<IListRecord>('/api/list-records', { body });
}
