import { appClient } from '@/src/utils/appClient';
import type { IUser } from '../models/User';

export function approveUserService({ userId }: { userId: number }) {
  return appClient.patch<IUser>(`/api/admin/users/${userId}/approve`, { body: {} });
}
