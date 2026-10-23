import { appClient } from '@/src/utils/appClient';

export function deleteListFieldService({ fieldId }: { fieldId: number }) {
  return appClient.delete<null>(`/api/settings/fields/${fieldId}`);
}
