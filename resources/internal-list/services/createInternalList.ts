import { appClient } from '@/src/utils/app-client';
import type { IInternalList } from '../models/InternalList';
import type { EInternalListDisplayStyle } from '../enums/InternalListDisplayStyle';
import type { PayloadBody } from '@/src/shared/types/api';

export type CreateInternalListServicePayload = {
  key: string;
  name: string;
  display_style?: `${EInternalListDisplayStyle}`;
};

export function createInternalListService({ body }: PayloadBody<CreateInternalListServicePayload>) {
  return appClient.post<IInternalList>('/api/settings/lists', { body });
}
