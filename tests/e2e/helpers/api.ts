import { expect, request as playwrightRequest, type Locator, type Page } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './auth';

export function uniqueSuffix() {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export type AdminApi = Awaited<ReturnType<typeof createAdminApi>>;

/** Cliente da API autenticado como admin — usado para preparar e limpar dados dos testes. */
export async function createAdminApi() {
  const request = await playwrightRequest.newContext({ baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000' });
  const login = await request.post('/api/auth/login', { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  expect(login.ok()).toBeTruthy();

  const token: string = (await login.json()).data.access_token;
  const headers = { Authorization: `Bearer ${token}` };

  async function call<T = any>(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, data?: unknown): Promise<T> {
    const res = await request[method](url, { headers, data });
    const body = await res.json();

    if (!res.ok()) throw new Error(`${method.toUpperCase()} ${url} → ${res.status()} ${JSON.stringify(body)}`);

    return body.data as T;
  }

  return {
    get: <T = any>(url: string) => call<T>('get', url),
    post: <T = any>(url: string, data: unknown) => call<T>('post', url, data),
    put: <T = any>(url: string, data: unknown) => call<T>('put', url, data),
    patch: <T = any>(url: string) => call<T>('patch', url, {}),
    delete: (url: string) => call('delete', url).catch(() => null),
    dispose: () => request.dispose(),
  };
}

/** Escolhe uma opção num Select do Mantine. */
export async function pickOption(page: Page, combobox: Locator, option: string) {
  await combobox.click();
  await page.getByRole('option', { name: option, exact: true }).last().click();
}

/** Arrasta uma alça do @dnd-kit até a posição de outra. */
export async function dragTo(page: Page, from: Locator, to: Locator) {
  await from.scrollIntoViewIfNeeded();
  await to.scrollIntoViewIfNeeded();
  await from.scrollIntoViewIfNeeded();

  const a = (await from.boundingBox())!;
  const b = (await to.boundingBox())!;

  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2 + 10, { steps: 5 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + 5, { steps: 20 });
  await page.waitForTimeout(150);
  await page.mouse.up();
}
