import { ApiMessage } from '@/src/shared/types/api';
import { useAuthStore } from '@/src/resources/auth/stores/useAuthStore';
import type { IAuthSession } from '@/src/resources/auth/models/AuthUser';

export type AppApiResponse<T> = {
  success: boolean;
  message: ApiMessage;
  data: T;
};

// Fila de espera enquanto um refresh está em voo — ver frontend-plan.md,
// seção 3. Qualquer chamada que tome 401 durante um refresh já em
// andamento entra aqui em vez de disparar um segundo refresh em paralelo.
let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
}

// Chamada crua (sem passar por `request`) para o próprio endpoint de
// refresh — não é exposta como um `service` de `resources/auth/services/`
// porque é uma dependência interna do client, chamada de dentro de
// `request()`; um service normal importaria `appClient`, que importaria de
// volta este arquivo (referência circular). Ver frontend-plan.md, seção 3.
async function refreshTokens(): Promise<IAuthSession> {
  const { refreshToken } = useAuthStore.getState();

  const res = await fetch('/api/auth/token/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data: AppApiResponse<IAuthSession> = await res.json();
  if (!data.success) throw data;
  return data.data;
}

function logoutAndRedirect() {
  useAuthStore.getState().logout();
  // Fora da árvore React/roteador (este client roda fora de componentes) —
  // redirect duro é aceitável aqui, ver frontend-plan.md, seção 3.
  if (typeof window !== 'undefined') window.location.assign('/auth/login');
}

// Rotas de auth que devolvem 401 por motivo de negócio (credenciais
// inválidas, refresh token expirado/revogado) — nunca por access_token
// vencido, já que essas chamadas não mandam `Authorization`. Um 401 nelas
// não deve disparar o fluxo de refresh (não há sessão a renovar).
const AUTH_NO_REFRESH_PREFIXES = ['/api/auth/login', '/api/auth/register', '/api/auth/token/refresh'];

function isAuthNoRefreshUrl(url: string) {
  return AUTH_NO_REFRESH_PREFIXES.some((prefix) => url.startsWith(prefix));
}

async function request<T>(url: string, options: RequestInit = {}, isRetry = false): Promise<AppApiResponse<T>> {
  const { accessToken } = useAuthStore.getState();

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  const data: AppApiResponse<T> = await res.json();
  if (data.success) return data;

  if (res.status !== 401 || isRetry || isAuthNoRefreshUrl(url)) throw data;

  if (isRefreshing) {
    await new Promise<void>((resolve, reject) => failedQueue.push({ resolve, reject }));
    return request<T>(url, options, true);
  }

  isRefreshing = true;

  try {
    const session = await refreshTokens();

    useAuthStore.getState().setTokens(session);
    useAuthStore.getState().setUser(session.user);

    processQueue(null);

    return request<T>(url, options, true);
  } catch (err) {
    processQueue(err);
    logoutAndRedirect();
    throw err;
  } finally {
    isRefreshing = false;
  }
}

export const appClient = {
  get<T>(url: string, options?: { signal?: AbortSignal }): Promise<AppApiResponse<T>> {
    return request<T>(url, { signal: options?.signal });
  },
  post<T>(url: string, options: { body: any; signal?: AbortSignal }): Promise<AppApiResponse<T>> {
    return request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body),
      signal: options.signal,
    });
  },
  put<T>(url: string, options: { body: any }): Promise<AppApiResponse<T>> {
    return request<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body),
    });
  },
  patch<T>(url: string, options: { body: any }): Promise<AppApiResponse<T>> {
    return request<T>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body),
    });
  },
  delete<T>(url: string): Promise<AppApiResponse<T>> {
    return request<T>(url, { method: 'DELETE' });
  },
};
