import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { useLoginLogicData, LoginLogicComponent } from '@/src/resources/auth/logics/Login';
import { loginUserService } from '@/src/resources/auth/services/loginUser';
import { useAuthStore } from '@/src/resources/auth/stores/useAuthStore';

vi.mock('@/src/resources/auth/services/loginUser', () => ({
  loginUserService: vi.fn(),
}));

const authUser = { id: 1, name: 'Ana', email: 'ana@example.com', role: 'admin', status: 'approved' };

function LoginHarness({ onSuccess }: { onSuccess: (user: typeof authUser) => void }) {
  const logicData = useLoginLogicData({ onSuccess });
  return <LoginLogicComponent logicData={logicData} />;
}

describe('Login logic', () => {
  beforeEach(() => {
    vi.mocked(loginUserService).mockReset();
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, sessionExpired: false });
  });

  it('shows validation errors and does not call the service when fields are empty', async () => {
    const onSuccess = vi.fn();

    renderWithProviders(<LoginHarness onSuccess={onSuccess} />);

    // O Form desativa a validação nativa (noValidate), então o clique real aciona a validação Yup.
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('E-mail é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    expect(loginUserService).not.toHaveBeenCalled();
  });

  it('submits credentials, stores the session and calls onSuccess', async () => {
    vi.mocked(loginUserService).mockResolvedValue({
      success: true,
      message: { 'pt-br': '', 'es-mx': '', 'en-us': '' },
      data: { user: authUser, access_token: 'access-1', refresh_token: 'refresh-1' },
    } as any);

    const user = userEvent.setup();
    const onSuccess = vi.fn();

    renderWithProviders(<LoginHarness onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('E-mail', { exact: false }), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha', { exact: false }), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(authUser));

    expect(loginUserService).toHaveBeenCalledWith({ body: { email: 'ana@example.com', password: 'secret123' } });
    expect(useAuthStore.getState().accessToken).toBe('access-1');
    expect(useAuthStore.getState().user).toEqual(authUser);
  });
});
