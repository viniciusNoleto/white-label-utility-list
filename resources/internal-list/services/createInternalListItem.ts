import { appClient } from '@/src/utils/app-client';
import type { IInternalListItem } from '../models/InternalList';
import type { EInternalListItemColor } from '../enums/InternalListItemColor';
import type { PayloadBody } from '@/src/shared/types/api';

export type CreateInternalListItemServicePayload = {
  label: string;
  color?: `${EInternalListItemColor}` | null;
};

export function createInternalListItemService({ listId, body }: { listId: number } & PayloadBody<CreateInternalListItemServicePayload>) {
  return appClient.post<IInternalListItem>(`/api/settings/lists/${listId}/items`, { body });
}
