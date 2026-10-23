import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Lista', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('carrega a tela de lista com o cabeçalho e os controles principais', async ({ page }) => {
    await expect(page).toHaveURL(/\/list$/);
    await expect(page.getByRole('heading', { name: 'Lista' })).toBeVisible();
    await expect(page.getByText('Gerencie os registros da tabela principal')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Novo registro' })).toBeVisible();
  });

  test('mantém a sessão ao recarregar a página', async ({ page }) => {
    await page.reload();

    await expect(page).toHaveURL(/\/list$/);
    await expect(page.getByRole('heading', { name: 'Lista' })).toBeVisible();
  });
});
