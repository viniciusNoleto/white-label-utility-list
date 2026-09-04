import { appClient } from '@/src/utils/app-client';
import type { IInternalListItem } from '../models/InternalList';
import type { EInternalListItemColor } from '../enums/InternalListItemColor';
import type { PayloadBody } from '@/src/shared/types/api';

export type UpdateInternalListItemServicePayload = {
  label?: string;
  position?: number;
  color?: `${EInternalListItemColor}` | null;
};

export function updateInternalListItemService({ listId, itemId, body }: { listId: number; itemId: number } & PayloadBody<UpdateInternalListItemServicePayload>) {
  return appClient.put<IInternalListItem>(`/api/settings/lists/${listId}/items/${itemId}`, { body });
}
