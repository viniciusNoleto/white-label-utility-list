import { appClient } from '@/src/utils/appClient';
import type { IUser } from '../models/User';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';
import type { PayloadQuery } from '@/src/shared/types/api';

export type GetUsersServiceQuery = {
  status?: 'pending' | 'approved' | 'rejected';
};

export const GET_USERS_KEY = ['get-users'];

export function getUsersService({ signal, query }: QueryFnCtx & PayloadQuery<GetUsersServiceQuery>) {
  const params = new URLSearchParams();
  if (query?.status) params.set('status', query.status);

  const qs = params.toString();

  return appClient.get<IUser[]>(`/api/admin/users${qs ? `?${qs}` : ''}`, { signal });
}
