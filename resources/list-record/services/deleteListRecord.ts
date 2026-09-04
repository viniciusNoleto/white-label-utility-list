import { appClient } from '@/src/utils/app-client';

export function deleteListRecordService({ recordId }: { recordId: number }) {
  return appClient.delete<null>(`/api/list-records/${recordId}`);
}
