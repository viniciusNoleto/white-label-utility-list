import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { pickOption } from './helpers/api';

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
});

test('alterna o tema claro/escuro e mantém a escolha após recarregar', async ({ page }) => {
  const html = page.locator('html');
  const toggle = page.getByRole('button', { name: 'Aparência' });

  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'light');

  await toggle.click();
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'dark');

  await page.getByRole('button', { name: 'Aparência' }).click();
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'light');
});

test('troca o idioma da interface e mantém a escolha após recarregar', async ({ page }) => {
  await pickOption(page, page.getByRole('combobox', { name: 'Idioma' }), 'English (US)');
  await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New record' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'List' })).toBeVisible();

  await pickOption(page, page.getByRole('combobox', { name: 'Language' }), 'Español (México)');
  await expect(page.getByRole('combobox', { name: 'Idioma' })).toHaveValue('Español (México)');

  await pickOption(page, page.getByRole('combobox', { name: 'Idioma' }), 'Português (Brasil)');
  await expect(page.getByRole('heading', { name: 'Lista' })).toBeVisible();
});

test('página inicial pública leva ao login e ao cadastro', async ({ browser }) => {
  const page = await (await browser.newContext()).newPage();
  await page.goto('/');

  await page.getByRole('link', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/auth\/register$/);

  await page.goto('/');
  await page.getByRole('link', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
});
