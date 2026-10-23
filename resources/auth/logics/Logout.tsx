import { useMutation } from '@tanstack/react-query';
import { logoutUserService } from '../services/logoutUser';
import { useAuthStore } from '../stores/useAuthStore';

export function useLogoutLogicData({ onSuccess }: { onSuccess: () => void }) {
  const logoutMutation = useMutation({
    mutationFn: () => logoutUserService({ body: { refresh_token: useAuthStore.getState().refreshToken ?? undefined } }),
    onSuccess: () => {
      useAuthStore.getState().logout();

      onSuccess();
    },
    onError: () => {
      useAuthStore.getState().logout();

      onSuccess();
    },
  });

  return {
    logoutMutation,
  };
}
