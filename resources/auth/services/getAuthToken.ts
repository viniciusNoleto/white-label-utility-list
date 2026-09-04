import { appClient } from '@/src/utils/app-client';
import type { QueryFnCtx } from '@/src/shared/types/tanstack';
import type { IAuthSession } from '../models/AuthUser';

export const GET_AUTH_TOKEN_KEY = ['get-auth-token'];

// GET /api/auth/token — confirma que o access_token ainda é válido e
// devolve o formato padrão de auth (user + access_token + refresh_token):
// o backend rotaciona o refresh_token a cada chamada bem-sucedida (não dá
// pra devolver o valor em texto plano de outra forma, já que só o hash fica
// guardado), então quem chama esta rota SEMPRE precisa persistir os tokens
// novos da resposta — nunca só o `user`, sob pena do refresh_token em
// memória ficar obsoleto. Usada pelo AuthHydrator como fallback quando a
// store tem tokens persistidos no cookie mas `user` ainda está vazio em
// memória (aba nova, refresh duro sem prop inicial de SSR). Ver
// frontend-plan.md, seção 5.
export function getAuthTokenService({ signal }: QueryFnCtx) {
  return appClient.get<IAuthSession>('/api/auth/token', { signal });
}
