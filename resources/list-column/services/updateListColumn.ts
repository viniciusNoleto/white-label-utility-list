import { appClient } from '@/src/utils/app-client';
import type { IListColumn } from '../models/ListColumn';
import type { PayloadBody } from '@/src/shared/types/api';

export type UpdateListColumnServicePayload = {
  label?: string;
  position?: number;
};

export function updateListColumnService({ columnId, body }: { columnId: number } & PayloadBody<UpdateListColumnServicePayload>) {
  return appClient.put<IListColumn>(`/api/settings/columns/${columnId}`, { body });
}
