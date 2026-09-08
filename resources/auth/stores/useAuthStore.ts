import { create } from 'zustand';
import type { IAuthUser } from '../models/AuthUser';

// Nomes de cookie idênticos aos que o backend usa (libs/auth/jwt.ts:
// ACCESS_TOKEN_COOKIE/REFRESH_TOKEN_COOKIE) e que `middleware`/`proxy.ts`
// espera ler — ver docs/auth/backend-plan.md e docs/auth/frontend-plan.md,
// seção 2.
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Mesmo TTL do refresh_token (30 dias, ver backend-plan.md) — o cookie não
// precisa durar mais que o token que ele carrega.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Decisão (opção "b" da seção 2 do frontend-plan.md): access_token e
// refresh_token são gravados como dois cookies simples e independentes,
// fora do ciclo `persist` do Zustand — não um único blob JSON. É o formato
// que `proxy.ts` (guarda de rota/renovação em SSR) e as Route Handlers do
// backend esperam ler diretamente, sem precisar conhecer o formato interno
// de serialização do `persist`. Por isso este store não usa
// `zustand/middleware` — o estado inicial é lido diretamente dos dois
// cookies na criação do store, e `setTokens`/`logout` escrevem/limpam esses
// mesmos cookies como efeito colateral.
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Strict`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=; max-age=0; path=/; SameSite=Strict`;
}

type AuthState = {
  user: IAuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  // true quando o app-client.ts detecta refresh_token reusado/morto (ver
  // utils/app-client.ts) — um componente próximo da raiz (AuthHydrator)
  // observa esta flag para navegar para /auth/login via router, em vez de
  // um reload duro de página.
  sessionExpired: boolean;
  setUser: (user: IAuthUser | null) => void;
  setTokens: (tokens: { access_token: string; refresh_token: string }) => void;
  // Relê os dois cookies e resincroniza o estado em memória com eles.
  // Necessário porque `proxy.ts` pode rotacionar os tokens em SSR (gravando
  // cookies novos) sem que este store, que só lê os cookies uma vez na
  // criação, fique sabendo — ver AuthHydrator, que chama isto a cada
  // navegação.
  resyncTokens: () => void;
  setSessionExpired: (value: boolean) => void;
  logout: () => void;
  isLogged: () => boolean;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  // `user` nunca é persistido em cookie — só vive em memória, populado pela
  // hidratação SSR (AuthHydrator) ou por GET /api/auth/token.
  user: null,
  accessToken: readCookie(ACCESS_TOKEN_COOKIE),
  refreshToken: readCookie(REFRESH_TOKEN_COOKIE),
  sessionExpired: false,
  setUser: (user) => set({ user }),
  setTokens: ({ access_token, refresh_token }) => {
    writeCookie(ACCESS_TOKEN_COOKIE, access_token);
    writeCookie(REFRESH_TOKEN_COOKIE, refresh_token);
    set({ accessToken: access_token, refreshToken: refresh_token });
  },
  resyncTokens: () => {
    const cookieAccessToken = readCookie(ACCESS_TOKEN_COOKIE);
    const cookieRefreshToken = readCookie(REFRESH_TOKEN_COOKIE);
    const { accessToken, refreshToken } = get();

    if (cookieAccessToken !== accessToken || cookieRefreshToken !== refreshToken) {
      set({ accessToken: cookieAccessToken, refreshToken: cookieRefreshToken });
    }
  },
  setSessionExpired: (value) => set({ sessionExpired: value }),
  logout: () => {
    clearCookie(ACCESS_TOKEN_COOKIE);
    clearCookie(REFRESH_TOKEN_COOKIE);
    set({ user: null, accessToken: null, refreshToken: null, sessionExpired: false });
  },
  isLogged: () => !!get().accessToken && !!get().user,
}));
