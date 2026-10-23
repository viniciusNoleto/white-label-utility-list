import { appClient } from '@/src/utils/appClient';
import { PayloadBody } from '@/src/shared/types/api';
import type { IAuthSession } from '../models/AuthUser';

export type LoginUserServicePayload = {
  email: string;
  password: string;
};

export function loginUserService({ body }: PayloadBody<LoginUserServicePayload>) {
  return appClient.post<IAuthSession>('/api/auth/login', { body });
}
