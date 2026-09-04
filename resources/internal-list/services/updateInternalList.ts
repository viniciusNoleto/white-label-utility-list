import { appClient } from '@/src/utils/app-client';
import type { IInternalList } from '../models/InternalList';
import type { EInternalListDisplayStyle } from '../enums/InternalListDisplayStyle';
import type { PayloadBody } from '@/src/shared/types/api';

export type UpdateInternalListServicePayload = {
  name?: string;
  display_style?: `${EInternalListDisplayStyle}`;
};

export function updateInternalListService({ listId, body }: { listId: number } & PayloadBody<UpdateInternalListServicePayload>) {
  return appClient.put<IInternalList>(`/api/settings/lists/${listId}`, { body });
}
