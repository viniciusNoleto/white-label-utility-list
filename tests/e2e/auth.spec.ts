import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, loginAsAdmin, uniqueEmail } from './helpers/auth';

test.describe('Autenticação', () => {
  test('exibe erros de validação ao tentar entrar com campos vazios', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('E-mail é obrigatório')).toBeVisible();
    await expect(page.getByText('Senha é obrigatória')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('exibe erro ao tentar entrar com credenciais inválidas', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel('E-mail', { exact: false }).fill('nao-existe@example.com');
    await page.getByLabel('Senha', { exact: false }).fill('wrongpassword123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('permite login com credenciais válidas e navega para a lista', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page).toHaveURL(/\/list$/);
    await expect(page.getByRole('banner').getByText('Administrador')).toBeVisible();
  });

  test('permite logout e retorna para a tela de login', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Sair' }).click();

    await page.waitForURL('**/auth/login');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('registra uma nova conta e mostra a tela de sucesso aguardando aprovação', async ({ page }) => {
    await page.goto('/auth/register');

    await page.getByLabel('Nome', { exact: false }).fill('Usuário de Teste E2E');
    await page.getByLabel('E-mail', { exact: false }).fill(uniqueEmail('e2e-register'));
    await page.getByLabel('Senha', { exact: false }).fill('secret123');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.getByText('Cadastro enviado!')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Voltar para o login' })).toBeVisible();
  });

  test('navega entre as telas de login e registro pelos links', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('link', { name: 'Cadastre-se' }).click();
    await expect(page).toHaveURL(/\/auth\/register$/);

    await page.getByRole('link', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('redireciona para o login ao acessar uma rota protegida sem sessão', async ({ page, context }) => {
    await context.clearCookies();

    await page.goto('/list');

    await page.waitForURL('**/auth/login');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});

test.describe('Credenciais seed', () => {
  test('usa o admin seedado do banco local', () => {
    expect(ADMIN_EMAIL).toBeTruthy();
    expect(ADMIN_PASSWORD).toBeTruthy();
  });
});
