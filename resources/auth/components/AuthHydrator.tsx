'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import { getAuthTokenService } from '../services/getAuthToken';
import type { IAuthUser } from '../models/AuthUser';

// Popula `user` na store Zustand a partir do resultado de `verifySession()`
// (Server Component), já que a store só existe no client — ver
// docs/auth/frontend-plan.md, seção 5. Montado uma única vez perto da raiz
// de `app/(protected)/layout.tsx` (e do layout de `/admin`), mas os efeitos
// abaixo rodam de novo a cada navegação porque `initialUser` é recalculado
// a cada verifySession() no servidor.
export function AuthHydrator({ initialUser }: { initialUser: IAuthUser }) {
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().setUser(initialUser);

    // `proxy.ts` pode ter rotacionado o access/refresh token em SSR durante
    // esta navegação (silenciosamente, gravando cookies novos) — sem isto,
    // o app-client.ts (client-side) continuaria mandando os tokens antigos,
    // já revogados no banco. A próxima renovação via /api/auth/token/refresh
    // reenviaria um refresh_token já consumido, o backend interpretaria
    // como reuso (possível roubo de token) e derrubaria a sessão inteira à
    // toa — era essa dessincronia que causava logout espúrio ao expirar o
    // access_token.
    useAuthStore.getState().resyncTokens();
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

  // Observa `sessionExpired` (setado por utils/app-client.ts quando o
  // refresh falha de vez) e navega para o login por dentro do router do
  // Next — este componente vive dentro da árvore React, ao contrário do
  // app-client.ts, então consegue evitar o reload completo de página (que
  // resetaria qualquer estado de tela em andamento, ex.: uma listagem
  // paginada).
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
