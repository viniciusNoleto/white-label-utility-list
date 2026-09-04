import { appClient } from '@/src/utils/app-client';

export function deleteObjectFieldService({ objectId, fieldId }: { objectId: number; fieldId: number }) {
  return appClient.delete<null>(`/api/settings/objects/${objectId}/fields/${fieldId}`);
}
