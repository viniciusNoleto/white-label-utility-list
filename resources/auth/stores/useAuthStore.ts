import { create } from 'zustand';
import type { IAuthUser } from '../models/AuthUser';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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
  sessionExpired: boolean;
  setUser: (user: IAuthUser | null) => void;
  setTokens: (tokens: { access_token: string; refresh_token: string }) => void;
  resyncTokens: () => void;
  setSessionExpired: (value: boolean) => void;
  logout: () => void;
  isLogged: () => boolean;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
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
