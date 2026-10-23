import { appClient } from '@/src/utils/appClient';
import { PayloadBody } from '@/src/shared/types/api';

export type RegisterUserServicePayload = {
  name: string;
  email: string;
  password: string;
};

export function registerUserService({ body }: PayloadBody<RegisterUserServicePayload>) {
  return appClient.post<null>('/api/auth/register', { body });
}
