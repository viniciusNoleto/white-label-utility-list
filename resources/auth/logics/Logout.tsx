import { useMutation } from '@tanstack/react-query';
import { logoutUserService } from '../services/logoutUser';
import { useAuthStore } from '../stores/useAuthStore';

// Só exporta o hook (padrão 1 de resources-logic.md normalmente também
// exporta um `LogoutLogicComponent` de confirmação) — o logout aqui é um
// clique direto no botão já existente em AppHeader, sem modal de
// confirmação, então não há UI própria para encapsular.
export function useLogoutLogicData({ onSuccess }: { onSuccess: () => void }) {
  const logoutMutation = useMutation({
    mutationFn: () => logoutUserService({ body: { refresh_token: useAuthStore.getState().refreshToken ?? undefined } }),
    onSuccess: () => {
      useAuthStore.getState().logout();

      onSuccess();
    },
    onError: () => {
      // Mesmo se a revogação falhar no backend, o client sempre derruba a
      // sessão local — ver frontend-plan.md, seção 6.
      useAuthStore.getState().logout();

      onSuccess();
    },
  });

  return {
    logoutMutation,
  };
}
