import { appClient } from '@/src/utils/appClient';
import type { IListField } from '../models/ListField';
import type { PayloadBody } from '@/src/shared/types/api';
import type { EListFieldType } from '../enums/ListFieldType';

export type UpdateListFieldServicePayload = {
  label?: string;
  type?: `${EListFieldType}`;
  required?: boolean;
  internal_list_id?: number | null;
  object_id?: number | null;
  position?: number;
};

export function updateListFieldService({ fieldId, body }: { fieldId: number } & PayloadBody<UpdateListFieldServicePayload>) {
  return appClient.put<IListField>(`/api/settings/fields/${fieldId}`, { body });
}
