import { appClient } from '@/src/utils/appClient';

export function deleteObjectService({ objectId }: { objectId: number }) {
  return appClient.delete<null>(`/api/settings/objects/${objectId}`);
}
