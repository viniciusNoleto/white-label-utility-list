import { appClient } from '@/src/utils/appClient';

export function deleteInternalListService({ listId }: { listId: number }) {
  return appClient.delete<null>(`/api/settings/lists/${listId}`);
}
