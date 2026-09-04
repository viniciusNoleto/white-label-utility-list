import { appClient } from '@/src/utils/app-client';
import type { IListRecord } from '../models/ListRecord';
import type { PayloadBody } from '@/src/shared/types/api';

export type UpdateListRecordServicePayload = {
  values: Record<string, any>;
};

export function updateListRecordService({ recordId, body }: { recordId: number } & PayloadBody<UpdateListRecordServicePayload>) {
  return appClient.put<IListRecord>(`/api/list-records/${recordId}`, { body });
}
