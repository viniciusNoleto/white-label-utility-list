import { appClient } from '@/src/utils/app-client';

export function deleteObjectService({ objectId }: { objectId: number }) {
  return appClient.delete<null>(`/api/settings/objects/${objectId}`);
}
