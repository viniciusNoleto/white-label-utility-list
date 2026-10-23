import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { createAdminApi, pickOption, uniqueSuffix, type AdminApi } from './helpers/api';

const s = uniqueSuffix();
let api: AdminApi;
const columnIds: Record<string, number> = {};

const TITLE = `Título ${s}`;
const STATUS = `Situação ${s}`;
const DUE = `Prazo ${s}`;
const AMOUNT = `Quantidade ${s}`;
const NOTES = `Observações ${s}`;
const REQUESTER = `Solicitante ${s}`;

function modal(page: Page) {
  return page.getByRole('dialog');
}

function recordRow(page: Page, title: string) {
  return page.getByRole('row').filter({ hasText: title });
}

async function openList(page: Page, query = '') {
  await page.goto(`/list${query}`);
  await page.waitForLoadState('networkidle');
}

async function createRecordViaApi(values: Record<string, unknown>) {
  return api.post('/api/list-records', {
    values: {
      [`titulo_${s}`]: '',
      [`situacao_${s}`]: '',
      [`prazo_${s}`]: '',
      [`qtd_${s}`]: null,
      [`obs_${s}`]: '',
      [`solicitante_${s}`]: null,
      ...values,
    },
  });
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  api = await createAdminApi();

  const list = await api.post('/api/settings/lists', { key: `status_${s}`, name: `Status ${s}`, display_style: 'badge' });
  await api.post(`/api/settings/lists/${list.id}/items`, { label: `Aberto ${s}`, color: 'blue' });
  await api.post(`/api/settings/lists/${list.id}/items`, { label: `Concluído ${s}`, color: 'green' });

  const object = await api.post('/api/settings/objects', { key: `pessoa_${s}`, name: `Pessoa ${s}` });
  await api.post(`/api/settings/objects/${object.id}/fields`, { key: 'nome', label: 'Nome', type: 'text', required: true });
  await api.post(`/api/settings/objects/${object.id}/fields`, { key: 'email', label: 'E-mail', type: 'text', required: false });

  const fields = [
    { key: `titulo_${s}`, label: TITLE, type: 'text', required: true },
    { key: `situacao_${s}`, label: STATUS, type: 'select', required: false, internal_list_id: list.id },
    { key: `prazo_${s}`, label: DUE, type: 'date', required: false },
    { key: `qtd_${s}`, label: AMOUNT, type: 'number', required: false },
    { key: `obs_${s}`, label: NOTES, type: 'long_text', required: false },
    { key: `solicitante_${s}`, label: REQUESTER, type: 'object', required: false, object_id: object.id },
  ];

  for (const field of fields) await api.post('/api/settings/fields', field);

  for (const [fieldKey, label, subPath] of [
    [`titulo_${s}`, TITLE],
    [`situacao_${s}`, STATUS],
    [`prazo_${s}`, DUE],
    [`qtd_${s}`, AMOUNT],
    [`solicitante_${s}`, REQUESTER, 'nome'],
  ] as const) {
    const column = await api.post('/api/settings/columns', { field_key: fieldKey, label, sub_path: subPath ?? null });
    columnIds[fieldKey] = column.id;
  }
});

test.afterAll(async () => {
  const records = await api.get<any>('/api/list-records?per_page=500');
  for (const record of records.items.filter((r: any) => r.values?.[`titulo_${s}`] !== undefined)) await api.delete(`/api/list-records/${record.id}`);

  for (const id of Object.values(columnIds)) await api.delete(`/api/settings/columns/${id}`);

  const fields = await api.get<any[]>('/api/settings/fields');
  for (const field of fields.filter(f => f.key.endsWith(s))) await api.delete(`/api/settings/fields/${field.id}`);

  const objects = await api.get<any[]>('/api/settings/objects');
  for (const object of objects.filter(o => o.key.endsWith(s))) await api.delete(`/api/settings/objects/${object.id}`);

  const lists = await api.get<any[]>('/api/settings/lists');
  for (const list of lists.filter(l => l.key.endsWith(s))) await api.delete(`/api/settings/lists/${list.id}`);

  await api.dispose();
});

test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
});

test('cria um registro validando campos obrigatórios e formata os valores na tabela', async ({ page }) => {
  await openList(page);

  for (const label of [TITLE, STATUS, DUE, AMOUNT, REQUESTER]) {
    await expect(page.getByRole('columnheader', { name: label })).toBeVisible();
  }

  await page.getByRole('button', { name: 'Novo registro' }).click();
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page).getByText(`O campo "${TITLE}" é obrigatório`)).toBeVisible();

  await modal(page).getByLabel(TITLE).fill(`Compra ${s}`);

  // Objeto opcional parcialmente preenchido exige os subcampos obrigatórios
  await modal(page).getByLabel('E-mail').fill('ana@empresa.com');
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page).getByText('O campo "Nome" é obrigatório')).toBeVisible();

  await modal(page).getByLabel('Nome').fill('Ana Souza');
  await pickOption(page, modal(page).getByRole('combobox', { name: STATUS }), `Aberto ${s}`);
  await modal(page).getByLabel(DUE).fill('2026-11-10');
  await modal(page).getByLabel(AMOUNT).fill('5');
  await modal(page).getByLabel(NOTES).fill('Equipamentos do suporte');
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page)).toBeHidden();

  const row = recordRow(page, `Compra ${s}`);
  await expect(row).toContainText('10/11/2026');
  await expect(row).toContainText('Ana Souza');
  await expect(row.locator('.mantine-Badge-root')).toHaveText(`Aberto ${s}`);
});

test('edita e exclui um registro', async ({ page }) => {
  await createRecordViaApi({ [`titulo_${s}`]: `Editar ${s}`, [`qtd_${s}`]: 1 });
  await createRecordViaApi({ [`titulo_${s}`]: `Excluir ${s}` });
  await openList(page);

  await recordRow(page, `Editar ${s}`).getByRole('button', { name: 'Editar' }).click();
  await expect(modal(page).getByLabel(TITLE)).toHaveValue(`Editar ${s}`);
  await modal(page).getByLabel(TITLE).fill(`Editado ${s}`);
  await pickOption(page, modal(page).getByRole('combobox', { name: STATUS }), `Concluído ${s}`);
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page)).toBeHidden();
  await expect(recordRow(page, `Editado ${s}`)).toContainText(`Concluído ${s}`);

  await recordRow(page, `Excluir ${s}`).getByRole('button', { name: 'Excluir' }).click();
  await modal(page).getByRole('button', { name: 'Cancelar' }).click();
  await expect(recordRow(page, `Excluir ${s}`)).toBeVisible();

  await recordRow(page, `Excluir ${s}`).getByRole('button', { name: 'Excluir' }).click();
  await modal(page).getByRole('button', { name: 'Excluir' }).click();
  await expect(recordRow(page, `Excluir ${s}`)).toHaveCount(0);
});

test('filtra por coluna de seleção e de texto, mantém os filtros na URL e remove filtros', async ({ page }) => {
  await createRecordViaApi({ [`titulo_${s}`]: `Filtro A ${s}`, [`situacao_${s}`]: `Aberto ${s}` });
  await createRecordViaApi({ [`titulo_${s}`]: `Filtro B ${s}`, [`situacao_${s}`]: `Concluído ${s}` });
  await createRecordViaApi({ [`titulo_${s}`]: `Outro ${s}`, [`situacao_${s}`]: `Concluído ${s}` });
  await openList(page);

  // Filtro de seleção usa as opções da lista interna
  await pickOption(page, page.getByPlaceholder('Selecione a coluna').first(), STATUS);
  await pickOption(page, page.getByPlaceholder('Pesquisar...').first(), `Concluído ${s}`);
  await expect(recordRow(page, `Filtro A ${s}`)).toHaveCount(0);
  await expect(recordRow(page, `Filtro B ${s}`)).toBeVisible();
  await expect(recordRow(page, `Outro ${s}`)).toBeVisible();
  await expect(page).toHaveURL(/filters=/);

  // Segundo filtro, de texto
  await page.getByRole('button', { name: 'Adicionar filtro' }).click();
  await pickOption(page, page.getByPlaceholder('Selecione a coluna').nth(1), TITLE);
  await page.getByPlaceholder('Pesquisar...').nth(1).fill('Filtro');
  await expect(recordRow(page, `Outro ${s}`)).toHaveCount(0);
  await expect(recordRow(page, `Filtro B ${s}`)).toBeVisible();

  // Os filtros sobrevivem ao recarregamento
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByPlaceholder('Pesquisar...').nth(1)).toHaveValue('Filtro');
  await expect(recordRow(page, `Outro ${s}`)).toHaveCount(0);

  // Remover o filtro de texto volta a mostrar "Outro"
  await page.getByRole('button', { name: 'Remover filtro' }).nth(1).click();
  await expect(recordRow(page, `Outro ${s}`)).toBeVisible();
});

test('pagina, troca a quantidade por página e mantém a página na URL', async ({ page }) => {
  for (let i = 1; i <= 12; i++) await createRecordViaApi({ [`titulo_${s}`]: `Pagina ${s} #${String(i).padStart(2, '0')}` });

  const filters = encodeURIComponent(JSON.stringify([{ column_id: String(columnIds[`titulo_${s}`]), value: `Pagina ${s}` }]));
  await openList(page, `?page=1&per_page=10&filters=${filters}`);

  const dataRows = page.getByRole('row').filter({ hasText: `Pagina ${s}` });
  await expect(dataRows).toHaveCount(10);

  await page.getByRole('button', { name: '2', exact: true }).click();
  await expect(dataRows).toHaveCount(2);
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole('row').nth(1)).toContainText('11');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(dataRows).toHaveCount(2);

  await pickOption(page, page.locator('input[role=combobox][value="10"]'), '25');
  await expect(dataRows).toHaveCount(12);
  await expect(page).toHaveURL(/per_page=25/);
  await expect(page).toHaveURL(/page=1/);
});

test('exporta os registros respeitando ou ignorando o filtro atual', async ({ page }) => {
  const filters = encodeURIComponent(JSON.stringify([{ column_id: String(columnIds[`titulo_${s}`]), value: `Pagina ${s}` }]));
  await openList(page, `?filters=${filters}`);

  await page.getByRole('button', { name: 'Exportar' }).click();
  await expect(modal(page).getByText('O filtro atual abaixo será considerado na exportação.')).toBeVisible();
  await expect(modal(page).getByText(`Pagina ${s}`)).toBeVisible();

  await modal(page).getByRole('button', { name: 'Ver tamanho estimado' }).click();
  await expect(modal(page).getByText(/^12 registro\(s\)/)).toBeVisible();

  await modal(page).getByRole('switch').uncheck();
  await expect(modal(page).getByText(/será ignorado/)).toBeVisible();
  await expect(modal(page).getByText(/^12 registro\(s\)/)).toHaveCount(0);

  await modal(page).getByRole('switch').check();
  await modal(page).getByRole('button', { name: 'Ver tamanho estimado' }).click();

  const downloadPromise = page.waitForEvent('download');
  await modal(page).getByRole('button', { name: 'Confirmar e baixar' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  await expect(page.getByText(/Download de ".*\.xlsx" concluído\./)).toBeVisible();
});

test('mostra o estado vazio quando o filtro não encontra registros', async ({ page }) => {
  const filters = encodeURIComponent(JSON.stringify([{ column_id: String(columnIds[`titulo_${s}`]), value: `inexistente-${s}` }]));
  await openList(page, `?filters=${filters}`);

  await expect(page.getByText('Nenhum registro encontrado.')).toBeVisible();

  await page.getByRole('button', { name: 'Exportar' }).click();
  await modal(page).getByRole('button', { name: 'Ver tamanho estimado' }).click();
  await expect(modal(page).getByText(/^0 registro\(s\)/)).toBeVisible();
});

test('API valida obrigatórios na criação e na edição, inclusive objetos opcionais', async () => {
  // Objeto opcional vazio é aceito
  const record = await createRecordViaApi({ [`titulo_${s}`]: `API ${s}` });

  // Título obrigatório
  await expect(createRecordViaApi({ [`titulo_${s}`]: '' })).rejects.toThrow(/422.*Título/);

  // Objeto opcional parcialmente preenchido exige o subcampo obrigatório
  await expect(createRecordViaApi({ [`titulo_${s}`]: `API2 ${s}`, [`solicitante_${s}`]: { nome: '', email: 'a@a.com' } })).rejects.toThrow(/422.*Nome/);

  // A edição aplica as mesmas regras
  await expect(api.put(`/api/list-records/${record.id}`, { values: { [`titulo_${s}`]: '' } })).rejects.toThrow(/422/);

  const updated = await api.put(`/api/list-records/${record.id}`, { values: { [`titulo_${s}`]: `API editado ${s}`, [`solicitante_${s}`]: { nome: 'Ana', email: '' } } });
  expect(updated.values[`titulo_${s}`]).toBe(`API editado ${s}`);
});
