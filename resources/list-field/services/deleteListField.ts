import { appClient } from '@/src/utils/app-client';

export function deleteListFieldService({ fieldId }: { fieldId: number }) {
  return appClient.delete<null>(`/api/settings/fields/${fieldId}`);
}
