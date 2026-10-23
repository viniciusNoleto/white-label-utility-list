import type { Page } from '@playwright/test';

export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!Change';

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login');

  await page.getByLabel('E-mail', { exact: false }).fill(ADMIN_EMAIL);
  await page.getByLabel('Senha', { exact: false }).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.waitForURL('**/list');
}

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}
