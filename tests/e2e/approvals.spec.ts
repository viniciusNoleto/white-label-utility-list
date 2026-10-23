import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin, uniqueEmail } from './helpers/auth';

const PASSWORD = 'senha12345';

async function register(page: Page, name: string, email: string) {
  await page.goto('/auth/register');
  await page.getByLabel('Nome', { exact: false }).fill(name);
  await page.getByLabel('E-mail', { exact: false }).fill(email);
  await page.getByLabel('Senha', { exact: false }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await expect(page.getByText('Cadastro enviado!')).toBeVisible();
}

async function tryLogin(page: Page, email: string) {
  await page.goto('/auth/login');
  await page.getByLabel('E-mail', { exact: false }).fill(email);
  await page.getByLabel('Senha', { exact: false }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

async function openUsersTab(page: Page, tab: 'pending' | 'approved' | 'rejected') {
  await page.goto(`/admin/users?tab=${tab}`);
  await page.waitForLoadState('networkidle');
}

function userRow(page: Page, email: string) {
  return page.getByRole('row').filter({ hasText: email });
}

test.describe.configure({ mode: 'serial' });

const email = uniqueEmail('e2e-approval');
const otherEmail = uniqueEmail('e2e-reject');

test('cadastro fica pendente e não consegue entrar', async ({ page }) => {
  await register(page, 'Pessoa Pendente', email);
  await register(page, 'Pessoa Rejeitada', otherEmail);

  await tryLogin(page, email);
  await expect(page.getByText('Sua conta ainda não foi aprovada por um administrador.')).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('cadastro valida os campos', async ({ page }) => {
  await page.goto('/auth/register');
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await expect(page.getByText('Nome é obrigatório')).toBeVisible();

  await page.getByLabel('Nome', { exact: false }).fill('X');
  await page.getByLabel('E-mail', { exact: false }).fill('invalido');
  await page.getByLabel('Senha', { exact: false }).fill('123');
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await expect(page.getByText('E-mail inválido')).toBeVisible();
  await expect(page.getByText('Senha deve ter no mínimo 8 caracteres')).toBeVisible();
});

test('admin aprova e rejeita cadastros navegando pelas abas', async ({ page }) => {
  await loginAsAdmin(page);
  await openUsersTab(page, 'pending');

  await expect(userRow(page, email)).toContainText('Pendente');

  await userRow(page, email).getByRole('button', { name: 'Aprovar' }).click();
  await expect(userRow(page, email)).toHaveCount(0);

  await userRow(page, otherEmail).getByRole('button', { name: 'Rejeitar' }).click();
  await expect(userRow(page, otherEmail)).toHaveCount(0);

  await page.getByText('Aprovados', { exact: true }).click();
  await expect(page).toHaveURL(/tab=approved/);
  await expect(userRow(page, email)).toContainText('Aprovado');
  await expect(userRow(page, email).getByRole('button', { name: 'Aprovar' })).toHaveCount(0);

  await page.getByText('Rejeitados', { exact: true }).click();
  await expect(userRow(page, otherEmail)).toContainText('Rejeitado');
  await expect(userRow(page, otherEmail).getByRole('button', { name: 'Rejeitar' })).toHaveCount(0);

  await page.goto('/admin/users?tab=invalida');
  await expect(page).toHaveURL(/tab=pending/);
});

test('usuário rejeitado não entra; usuário aprovado entra sem acesso às telas de admin', async ({ page }) => {
  await tryLogin(page, otherEmail);
  await expect(page.getByRole('alert').first()).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login$/);

  await tryLogin(page, email);
  await page.waitForURL('**/list');
  await expect(page.getByRole('banner')).toContainText('Pessoa Pendente');

  await page.getByRole('button', { name: 'Menu' }).click();
  const sidebar = page.getByRole('complementary');
  await expect(sidebar.getByRole('link', { name: 'Lista' })).toBeVisible();
  await expect(sidebar.getByRole('link', { name: 'Aprovações' })).toHaveCount(0);
  await expect(sidebar.getByRole('link', { name: 'Configurações' })).toHaveCount(0);
  await sidebar.getByRole('button', { name: 'Fechar' }).click();

  await page.goto('/admin/settings');
  await expect(page).toHaveURL(/\/list$/);

  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/list$/);

  const status = await page.evaluate(async () => (await fetch('/api/admin/users')).status);
  expect(status).toBe(401);
});
