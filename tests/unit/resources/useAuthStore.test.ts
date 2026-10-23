import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/src/resources/auth/stores/useAuthStore';

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; max-age=0; path=/`;
  });
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies();
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, sessionExpired: false });
  });

  it('starts logged out', () => {
    expect(useAuthStore.getState().isLogged()).toBe(false);
  });

  it('setTokens stores tokens in state and cookies', () => {
    useAuthStore.getState().setTokens({ access_token: 'access-1', refresh_token: 'refresh-1' });

    expect(useAuthStore.getState().accessToken).toBe('access-1');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-1');
    expect(document.cookie).toContain('access_token=access-1');
    expect(document.cookie).toContain('refresh_token=refresh-1');
  });

  it('isLogged is true only when there is both a user and an access token', () => {
    useAuthStore.getState().setTokens({ access_token: 'access-1', refresh_token: 'refresh-1' });
    expect(useAuthStore.getState().isLogged()).toBe(false);

    useAuthStore.getState().setUser({ id: 1, name: 'Ana', email: 'ana@example.com', role: 'admin', status: 'approved' });
    expect(useAuthStore.getState().isLogged()).toBe(true);
  });

  it('logout clears user, tokens and cookies', () => {
    useAuthStore.getState().setTokens({ access_token: 'access-1', refresh_token: 'refresh-1' });
    useAuthStore.getState().setUser({ id: 1, name: 'Ana', email: 'ana@example.com', role: 'admin', status: 'approved' });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
    expect(document.cookie).not.toContain('access_token=access-1');
  });

  it('resyncTokens pulls updated cookie values into state', () => {
    useAuthStore.getState().setTokens({ access_token: 'access-1', refresh_token: 'refresh-1' });

    document.cookie = 'access_token=access-2; path=/';

    useAuthStore.getState().resyncTokens();

    expect(useAuthStore.getState().accessToken).toBe('access-2');
  });

  it('setSessionExpired toggles the sessionExpired flag', () => {
    useAuthStore.getState().setSessionExpired(true);
    expect(useAuthStore.getState().sessionExpired).toBe(true);
  });
});
