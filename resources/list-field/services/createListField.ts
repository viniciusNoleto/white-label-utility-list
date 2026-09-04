import { appClient } from '@/src/utils/app-client';
import type { IListField } from '../models/ListField';
import type { PayloadBody } from '@/src/shared/types/api';
import type { EListFieldType } from '../enums/ListFieldType';

export type CreateListFieldServicePayload = {
  key: string;
  label: string;
  type: `${EListFieldType}`;
  required: boolean;
  internal_list_id?: number | null;
  object_id?: number | null;
};

export function createListFieldService({ body }: PayloadBody<CreateListFieldServicePayload>) {
  return appClient.post<IListField>('/api/settings/fields', { body });
}
