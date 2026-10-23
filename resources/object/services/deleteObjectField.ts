import { appClient } from '@/src/utils/appClient';

export function deleteObjectFieldService({ objectId, fieldId }: { objectId: number; fieldId: number }) {
  return appClient.delete<null>(`/api/settings/objects/${objectId}/fields/${fieldId}`);
}
