import { appClient } from '@/src/utils/app-client';
import type { IObjectField } from '../models/Object';
import type { PayloadBody } from '@/src/shared/types/api';
import type { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';

export type CreateObjectFieldServicePayload = {
  key: string;
  label: string;
  type: `${EListFieldType}`;
  required: boolean;
  internal_list_id?: number | null;
};

export function createObjectFieldService({ objectId, body }: { objectId: number } & PayloadBody<CreateObjectFieldServicePayload>) {
  return appClient.post<IObjectField>(`/api/settings/objects/${objectId}/fields`, { body });
}
