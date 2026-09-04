'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { getAuthTokenService } from '../services/getAuthToken';
import type { IAuthUser } from '../models/AuthUser';

// Popula `user` na store Zustand a partir do resultado de `verifySession()`
// (Server Component), já que a store só existe no client — ver
// docs/auth/frontend-plan.md, seção 5. Montado uma única vez perto da raiz
// de `app/(protected)/layout.tsx` (e do layout de `/admin`).
export function AuthHydrator({ initialUser }: { initialUser: IAuthUser }) {
  useEffect(() => {
    useAuthStore.getState().setUser(initialUser);
  }, [initialUser]);

  // Fallback para navegação inteiramente client-side sem um novo SSR
  // completo (ex.: `accessToken` presente no cookie mas `user` nulo em
  // memória por algum motivo) — revalida via GET /api/auth/token. Raro em
  // App Router porque `initialUser` já vem sempre populado por
  // `verifySession()`, mas cobre o caso defensivamente.
  useEffect(() => {
    const { user, accessToken } = useAuthStore.getState();
    if (user || !accessToken) return;

    getAuthTokenService({}).then((res) => {
      // Persistir os dois tokens é obrigatório aqui: GET /api/auth/token
      // rotaciona o refresh_token a cada chamada — se só `setUser` fosse
      // chamado, o refresh_token em memória ficaria com um valor já
      // invalidado no backend, quebrando a próxima renovação.
      useAuthStore.getState().setTokens(res.data);
      useAuthStore.getState().setUser(res.data.user);
    }).catch(() => {
      // Se o token não for mais válido, o próprio `appClient` já cuida do
      // refresh/logout — nada a fazer aqui além de ignorar o erro.
    });
  }, []);

  return null;
}
