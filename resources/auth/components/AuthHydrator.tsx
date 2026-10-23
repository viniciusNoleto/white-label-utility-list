'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import type { IAuthUser } from '../models/AuthUser';

export function AuthHydrator({ initialUser }: { initialUser: IAuthUser }) {
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().setUser(initialUser);

    useAuthStore.getState().resyncTokens();
  }, [initialUser]);

  useEffect(() => {
    return useAuthStore.subscribe((state, prevState) => {
      if (!state.sessionExpired || prevState.sessionExpired) return;

      useAuthStore.getState().setSessionExpired(false);
      router.push('/auth/login');
      router.refresh();
    });
  }, [router]);

  return null;
}
