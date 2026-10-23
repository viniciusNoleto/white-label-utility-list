import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLogoutLogicData } from '@/src/resources/auth/logics/Logout';
import { logoutUserService } from '@/src/resources/auth/services/logoutUser';
import { useAuthStore } from '@/src/resources/auth/stores/useAuthStore';

vi.mock('@/src/resources/auth/services/logoutUser', () => ({
  logoutUserService: vi.fn(),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('Logout logic', () => {
  beforeEach(() => {
    vi.mocked(logoutUserService).mockReset();
    useAuthStore.setState({ user: { id: 1, name: 'Ana', email: 'ana@example.com', role: 'admin', status: 'approved' }, accessToken: 'access-1', refreshToken: 'refresh-1', sessionExpired: false });
  });

  it('clears the auth store and calls onSuccess when the request succeeds', async () => {
    vi.mocked(logoutUserService).mockResolvedValue({ success: true, message: { 'pt-br': '', 'es-mx': '', 'en-us': '' }, data: null } as any);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useLogoutLogicData({ onSuccess }), { wrapper });

    act(() => {
      result.current.logoutMutation.mutate();
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(logoutUserService).toHaveBeenCalledWith({ body: { refresh_token: 'refresh-1' } });
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('still clears the auth store and calls onSuccess when the request fails', async () => {
    vi.mocked(logoutUserService).mockRejectedValue(new Error('network error'));

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useLogoutLogicData({ onSuccess }), { wrapper });

    act(() => {
      result.current.logoutMutation.mutate();
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
