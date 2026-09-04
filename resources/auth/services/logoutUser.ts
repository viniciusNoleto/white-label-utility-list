import { appClient } from '@/src/utils/app-client';
import { PayloadBody } from '@/src/shared/types/api';

export type LogoutUserServicePayload = {
  refresh_token?: string;
};

export function logoutUserService({ body }: PayloadBody<LogoutUserServicePayload>) {
  return appClient.post<null>('/api/auth/logout', { body });
}
