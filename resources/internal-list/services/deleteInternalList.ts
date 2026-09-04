import { appClient } from '@/src/utils/app-client';

export function deleteInternalListService({ listId }: { listId: number }) {
  return appClient.delete<null>(`/api/settings/lists/${listId}`);
}
