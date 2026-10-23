import { appClient } from '@/src/utils/appClient';
import type { IListColumn } from '../models/ListColumn';
import type { PayloadBody } from '@/src/shared/types/api';

export type CreateListColumnServicePayload = {
  field_key: string;
  sub_path?: string | null;
  label: string;
};

export function createListColumnService({ body }: PayloadBody<CreateListColumnServicePayload>) {
  return appClient.post<IListColumn>('/api/settings/columns', { body });
}
