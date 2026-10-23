import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import i18n from '@/libs/i18n';
import { LANGUAGE_STORAGE_KEY } from '@/src/libs/i18n';
import { AppShell } from '@/src/components/layout/AppShell';
import { WavesBackground } from '@/src/components/layout/WavesBackground';
import { LanguageSwitcher } from '@/src/components/utils/LanguageSwitcher';
import { AuthHydrator } from '@/src/resources/auth/components/AuthHydrator';
import { useAuthStore } from '@/src/resources/auth/stores/useAuthStore';
import { logoutUserService } from '@/src/resources/auth/services/logoutUser';

const router = { push: vi.fn(), refresh: vi.fn(), replace: vi.fn() };
let pathname = '/list';

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => pathname,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span data-testid="logo">{alt}</span>,
}));

vi.mock('@/src/resources/auth/services/logoutUser', () => ({ logoutUserService: vi.fn() }));

const admin = { id: 1, name: 'Ana Souza', email: 'ana@example.com', role: 'admin', status: 'approved' } as const;
const member = { ...admin, id: 2, name: 'Bruno', email: 'bruno@example.com', role: 'user' } as const;

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pathname = '/list';
  });

  afterEach(async () => {
    await act(() => i18n.changeLanguage('pt-br'));
  });

  it('renders header, footer, children and all admin links in the sidebar', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AppShell user={admin as any}>
        <p>
          Conteúdo
        </p>
      </AppShell>,
    );

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Ana Souza');
    expect(screen.getByText('Vinícius Nolêto de Araújo')).toHaveAttribute('target', '_blank');
    expect(screen.getByText('AS')).toBeInTheDocument();

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('-translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(sidebar).toHaveClass('translate-x-0');

    expect(screen.getByRole('link', { name: 'Lista' })).toHaveClass('bg-primary-50');
    expect(screen.getByRole('link', { name: 'Aprovações' })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: 'Configurações' })).toHaveAttribute('href', '/admin/settings');

    await user.click(screen.getByRole('link', { name: 'Configurações' }));
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('hides admin links for regular users and closes the sidebar via its close button', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AppShell user={member as any}>
        <span />
      </AppShell>,
    );

    await user.click(screen.getByRole('button', { name: 'Menu' }));

    expect(screen.getByRole('link', { name: 'Lista' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Aprovações' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Configurações' })).not.toBeInTheDocument();

    const sidebar = screen.getByRole('complementary');
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('toggles the color scheme and logs out', async () => {
    vi.mocked(logoutUserService).mockResolvedValue({ success: true, message: { 'pt-br': '', 'es-mx': '', 'en-us': '' }, data: null });
    const user = userEvent.setup();

    renderWithProviders(
      <AppShell user={admin as any}>
        <span />
      </AppShell>,
    );

    await user.click(screen.getByRole('button', { name: 'Aparência' }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark'));

    await user.click(screen.getByRole('button', { name: 'Aparência' }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'light'));

    await user.click(screen.getByRole('button', { name: 'Sair' }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/auth/login'));
  });
});

describe('LanguageSwitcher', () => {
  afterEach(async () => {
    await act(() => i18n.changeLanguage('pt-br'));
    localStorage.clear();
  });

  it('changes the language and persists it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('combobox', { name: 'Idioma' }));
    await user.click(await screen.findByRole('option', { name: 'English (US)', hidden: true }));

    expect(i18n.language).toBe('en-us');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en-us');
    expect(await screen.findByRole('combobox', { name: 'Language' })).toBeInTheDocument();
  });
});

describe('WavesBackground', () => {
  it('renders decorative waves hidden from assistive technologies', () => {
    const { container } = renderWithProviders(<WavesBackground />);

    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(3);
  });
});

describe('AuthHydrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, sessionExpired: false });
  });

  it('stores the initial user from the server and resyncs the tokens from the cookies', () => {
    document.cookie = 'access_token=cookie-access; path=/';
    document.cookie = 'refresh_token=cookie-refresh; path=/';

    renderWithProviders(<AuthHydrator initialUser={admin as any} />);

    expect(useAuthStore.getState().user).toEqual(admin);
    expect(useAuthStore.getState().accessToken).toBe('cookie-access');
    expect(useAuthStore.getState().refreshToken).toBe('cookie-refresh');

    document.cookie = 'access_token=; max-age=0; path=/';
    document.cookie = 'refresh_token=; max-age=0; path=/';
  });

  it('redirects to the login when the session expires', () => {
    renderWithProviders(<AuthHydrator initialUser={admin as any} />);

    act(() => useAuthStore.getState().setSessionExpired(true));

    expect(router.push).toHaveBeenCalledWith('/auth/login');
    expect(router.refresh).toHaveBeenCalled();
    expect(useAuthStore.getState().sessionExpired).toBe(false);
  });
});
