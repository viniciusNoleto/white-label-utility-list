import { appClient } from '@/src/utils/appClient';

export function deleteListRecordService({ recordId }: { recordId: number }) {
  return appClient.delete<null>(`/api/list-records/${recordId}`);
}
