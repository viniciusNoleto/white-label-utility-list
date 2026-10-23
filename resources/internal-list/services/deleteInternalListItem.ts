import { appClient } from '@/src/utils/appClient';

export function deleteInternalListItemService({ listId, itemId }: { listId: number; itemId: number }) {
  return appClient.delete<null>(`/api/settings/lists/${listId}/items/${itemId}`);
}
