import { appClient } from '@/src/utils/appClient';

export function deleteListColumnService({ columnId }: { columnId: number }) {
  return appClient.delete<null>(`/api/settings/columns/${columnId}`);
}
