import { appClient } from '@/src/utils/app-client';

export function deleteListColumnService({ columnId }: { columnId: number }) {
  return appClient.delete<null>(`/api/settings/columns/${columnId}`);
}
