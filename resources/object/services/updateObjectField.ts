import { appClient } from '@/src/utils/app-client';
import type { IObjectField } from '../models/Object';
import type { PayloadBody } from '@/src/shared/types/api';
import type { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';

export type UpdateObjectFieldServicePayload = {
  label?: string;
  type?: `${EListFieldType}`;
  required?: boolean;
  internal_list_id?: number | null;
  position?: number;
};

export function updateObjectFieldService({ objectId, fieldId, body }: { objectId: number; fieldId: number } & PayloadBody<UpdateObjectFieldServicePayload>) {
  return appClient.put<IObjectField>(`/api/settings/objects/${objectId}/fields/${fieldId}`, { body });
}
