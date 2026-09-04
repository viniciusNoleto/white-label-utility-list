import { appClient } from '@/src/utils/app-client';
import { PayloadBody } from '@/src/shared/types/api';
import type { IAuthUser } from '../models/AuthUser';

export type LoginUserServicePayload = {
  email: string;
  password: string;
};

export function loginUserService({ body }: PayloadBody<LoginUserServicePayload>) {
  return appClient.post<IAuthUser>('/api/auth/login', { body });
}
