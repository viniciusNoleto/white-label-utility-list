import { appClient } from '@/src/utils/app-client';

export function logoutUserService() {
  return appClient.post<null>('/api/auth/logout', { body: {} });
}
