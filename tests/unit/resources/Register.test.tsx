import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { useRegisterLogicData, RegisterLogicComponent } from '@/src/resources/auth/logics/Register';
import { registerUserService } from '@/src/resources/auth/services/registerUser';

vi.mock('@/src/resources/auth/services/registerUser', () => ({
  registerUserService: vi.fn(),
}));

function RegisterHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useRegisterLogicData({ onSuccess });
  return <RegisterLogicComponent logicData={logicData} />;
}

describe('Register logic', () => {
  beforeEach(() => {
    vi.mocked(registerUserService).mockReset();
  });

  it('shows required-field errors when submitted empty', async () => {
    const onSuccess = vi.fn();

    const { container } = renderWithProviders(<RegisterHarness onSuccess={onSuccess} />);

    // The native `required` attribute blocks a real click submission with empty fields,
    // so the submit event is dispatched directly to exercise our Yup-based validation.
    fireEvent.submit(container.querySelector('form')!);

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
    // Yup runs both `.required()` and `.min(8)` for an empty string and keeps the last
    // failing test's message, so the min-length message wins over the required one here.
    expect(screen.getByText('Senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();
    expect(registerUserService).not.toHaveBeenCalled();
  });

  it('shows a password minimum-length error for a too-short password', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    renderWithProviders(<RegisterHarness onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('Nome', { exact: false }), 'Ana Souza');
    await user.type(screen.getByLabelText('E-mail', { exact: false }), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha', { exact: false }), '123');

    expect(await screen.findByText('Senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('Senha deve ter no mínimo 8 caracteres')).toBeInTheDocument();
    expect(registerUserService).not.toHaveBeenCalled();
  });

  it('submits valid data and calls onSuccess', async () => {
    vi.mocked(registerUserService).mockResolvedValue({
      success: true,
      message: { 'pt-br': '', 'es-mx': '', 'en-us': '' },
      data: null,
    } as any);

    const user = userEvent.setup();
    const onSuccess = vi.fn();

    renderWithProviders(<RegisterHarness onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('Nome', { exact: false }), 'Ana Souza');
    await user.type(screen.getByLabelText('E-mail', { exact: false }), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha', { exact: false }), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    expect(registerUserService).toHaveBeenCalledWith({
      body: { name: 'Ana Souza', email: 'ana@example.com', password: 'secret123' },
    });
  });
});
