import { appClient } from '@/src/utils/appClient';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';
import type { IAuthSession } from '../models/AuthUser';

export const GET_AUTH_TOKEN_KEY = ['get-auth-token'];

export function getAuthTokenService({ signal }: QueryFnCtx) {
  return appClient.get<IAuthSession>('/api/auth/token', { signal });
}
