import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { createAdminApi, dragTo, pickOption, uniqueSuffix, type AdminApi } from './helpers/api';

const s = uniqueSuffix();
let api: AdminApi;

function modal(page: Page) {
  return page.getByRole('dialog');
}

async function openTab(page: Page, tab: 'fields' | 'columns' | 'lists' | 'objects') {
  await page.goto(`/admin/settings?tab=${tab}`);
  await page.waitForLoadState('networkidle');
}

function listItemRow(page: Page, label: string) {
  return page.locator('div.rounded-lg.border').filter({ hasText: label });
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  api = await createAdminApi();
});

test.afterAll(async () => {
  const columns = await api.get<any[]>('/api/settings/columns');
  for (const column of columns.filter(c => c.field_key.endsWith(s))) await api.delete(`/api/settings/columns/${column.id}`);

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

test('navega entre as abas de configuração pela URL', async ({ page }) => {
  await openTab(page, 'fields');
  await expect(page.getByRole('button', { name: 'Novo campo' })).toBeVisible();

  await page.getByText('Colunas', { exact: true }).click();
  await expect(page).toHaveURL(/tab=columns/);
  await expect(page.getByRole('button', { name: 'Nova coluna' })).toBeVisible();

  await page.getByText('Listas', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nova lista' })).toBeVisible();

  await page.getByText('Objetos', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Novo objeto' })).toBeVisible();

  await page.goto('/admin/settings?tab=invalida');
  await expect(page).toHaveURL(/tab=fields/);
});

test('listas: cria, adiciona/edita/reordena/remove itens, edita e exclui a lista', async ({ page }) => {
  await openTab(page, 'lists');

  // Validação
  await page.getByRole('button', { name: 'Nova lista' }).click();
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page).getByText('Nome é obrigatório')).toBeVisible();

  await modal(page).getByLabel('Nome da lista').fill(`Status ${s}`);
  await modal(page).getByLabel('Chave').fill(`status_${s}`);
  await pickOption(page, modal(page).getByRole('combobox', { name: /Estilo de exibição/ }), 'Badge');
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page)).toBeHidden();

  // A lista recém-criada fica selecionada
  await expect(page.getByText(`Chave: status_${s}`)).toBeVisible();

  const itemInput = page.getByLabel('Novo item');
  for (const label of ['A', 'B', 'C']) {
    await itemInput.fill(`${label} ${s}`);
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(listItemRow(page, `${label} ${s}`)).toBeVisible();
  }
  await expect(page.getByRole('button', { name: new RegExp(`Status ${s}.*3 itens`) })).toBeVisible();

  // Editar item: rótulo e cor
  await listItemRow(page, `A ${s}`).getByRole('button', { name: 'Editar' }).click();
  await modal(page).getByLabel('Novo item').fill(`A1 ${s}`);
  await pickOption(page, modal(page).getByRole('combobox', { name: /Cor/ }), 'Verde');
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page)).toBeHidden();
  await expect(listItemRow(page, `A1 ${s}`).locator('.mantine-Badge-root')).toHaveAttribute('style', /green/);

  // Reordenar: C para o topo
  await dragTo(page, listItemRow(page, `C ${s}`).getByRole('button').first(), listItemRow(page, `A1 ${s}`).getByRole('button').first());
  await expect.poll(async () => {
    const list = (await api.get<any[]>('/api/settings/lists')).find(l => l.key === `status_${s}`);
    return [...list.items].sort((a: any, b: any) => a.position - b.position).map((i: any) => i.label);
  }).toEqual([`C ${s}`, `A1 ${s}`, `B ${s}`]);

  // Remover item
  await listItemRow(page, `B ${s}`).getByRole('button', { name: 'Excluir' }).click();
  await expect(listItemRow(page, `B ${s}`)).toHaveCount(0);

  // Editar a lista
  await page.getByRole('button', { name: 'Editar', exact: true }).first().click();
  await modal(page).getByLabel('Nome da lista').fill(`Situações ${s}`);
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('button', { name: new RegExp(`Situações ${s}`) })).toBeVisible();

  // Excluir a lista (cancelar primeiro)
  await page.getByRole('button', { name: 'Excluir lista' }).click();
  await expect(modal(page).getByText(`Situações ${s}`)).toBeVisible();
  await modal(page).getByRole('button', { name: 'Cancelar' }).click();
  await page.getByRole('button', { name: 'Excluir lista' }).click();
  await modal(page).getByRole('button', { name: 'Excluir' }).click();
  await expect(page.getByRole('button', { name: new RegExp(`Situações ${s}`) })).toHaveCount(0);
});

test('objetos: cria com partes, edita as partes e exclui', async ({ page }) => {
  const list = await api.post('/api/settings/lists', { key: `setores_${s}`, name: `Setores ${s}`, display_style: 'text' });

  await openTab(page, 'objects');

  await page.getByRole('button', { name: 'Novo objeto' }).click();
  await modal(page).getByLabel('Nome do objeto').fill(`Pessoa ${s}`);
  await modal(page).getByLabel('Chave').fill(`pessoa_${s}`);

  // Parte inválida bloqueia o envio
  await modal(page).getByRole('button', { name: 'Parte' }).click();
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page).getByText('Rótulo é obrigatório')).toBeVisible();

  await modal(page).getByPlaceholder('Rótulo').nth(0).fill('Nome');
  await modal(page).getByPlaceholder('chave').nth(0).fill('nome');
  await modal(page).getByRole('button', { name: 'Campo obrigatório' }).nth(0).click();

  await modal(page).getByRole('button', { name: 'Parte' }).click();
  await modal(page).getByPlaceholder('Rótulo').nth(1).fill('Setor');
  await modal(page).getByPlaceholder('chave').nth(1).fill('setor');
  await pickOption(page, modal(page).getByRole('combobox').nth(1), 'Seleção (lista)');
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page).getByText('Selecione uma lista')).toBeVisible();
  await pickOption(page, modal(page).getByPlaceholder('Selecione a lista de opções'), `Setores ${s}`);

  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page)).toBeHidden();

  const objectRow = page.locator('div.p-4\\.5').filter({ hasText: `pessoa_${s}` });
  await expect(objectRow.getByText('2 partes')).toBeVisible();
  await expect(objectRow.getByText('Nome *')).toBeVisible();

  // Editar partes: remove "Setor" e adiciona "Nascimento" (data)
  await objectRow.getByRole('button', { name: 'Editar partes' }).click();
  await expect(modal(page).getByPlaceholder('chave').nth(0)).toBeDisabled();
  await modal(page).getByRole('button', { name: 'Excluir' }).nth(1).click();
  await modal(page).getByRole('button', { name: 'Parte' }).click();
  await modal(page).getByPlaceholder('Rótulo').nth(1).fill('Nascimento');
  await modal(page).getByPlaceholder('chave').nth(1).fill('nascimento');
  await pickOption(page, modal(page).getByRole('combobox').nth(1), 'Data');
  await modal(page).getByRole('button', { name: 'Salvar objeto' }).click();
  await expect(modal(page)).toBeHidden();
  await expect(objectRow.getByText('Nascimento')).toBeVisible();
  await expect(objectRow.getByText('Setor')).toHaveCount(0);

  // Excluir
  await objectRow.getByRole('button', { name: 'Excluir objeto' }).click();
  await modal(page).getByRole('button', { name: 'Excluir' }).click();
  await expect(page.locator('div.p-4\\.5').filter({ hasText: `pessoa_${s}` })).toHaveCount(0);

  await api.delete(`/api/settings/lists/${list.id}`);
});

test('campos: cria de cada tipo, edita, reordena e exclui', async ({ page }) => {
  await api.post('/api/settings/lists', { key: `prio_${s}`, name: `Prioridades ${s}`, display_style: 'badge' });
  const object = await api.post('/api/settings/objects', { key: `contato_${s}`, name: `Contato ${s}` });
  await api.post(`/api/settings/objects/${object.id}/fields`, { key: 'nome', label: 'Nome', type: 'text', required: true });

  await openTab(page, 'fields');

  const create = async (label: string, key: string, type: string, extra?: () => Promise<void>, required = false) => {
    await page.getByRole('button', { name: 'Novo campo' }).click();
    await modal(page).getByLabel('Rótulo').fill(label);
    await modal(page).getByLabel('Chave').fill(key);
    if (type !== 'Texto curto') await pickOption(page, modal(page).getByRole('combobox', { name: /^Tipo/ }), type);
    await extra?.();
    if (required) await modal(page).getByRole('switch').check();
    await modal(page).getByRole('button', { name: 'Salvar' }).click();
    await expect(modal(page)).toBeHidden();
    await expect(page.getByRole('row').filter({ hasText: key })).toBeVisible();
  };

  // Chave inválida
  await page.getByRole('button', { name: 'Novo campo' }).click();
  await modal(page).getByLabel('Rótulo').fill('X');
  await modal(page).getByLabel('Chave').fill('Chave Inválida');
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page).getByText('Use apenas letras minúsculas, números e "_"')).toBeVisible();
  await modal(page).getByRole('button', { name: 'Cancelar' }).click();

  await create(`Titulo ${s}`, `titulo_${s}`, 'Texto curto', undefined, true);
  await create(`Notas ${s}`, `notas_${s}`, 'Texto longo');
  await create(`Prazo ${s}`, `prazo_${s}`, 'Data');
  await create(`Qtd ${s}`, `qtd_${s}`, 'Número');
  await create(`Prioridade ${s}`, `prio_${s}`, 'Seleção (lista)', () => pickOption(page, modal(page).getByRole('combobox', { name: /^Lista/ }), `Prioridades ${s}`));
  await create(`Contato ${s}`, `contato_${s}`, 'Objeto', () => pickOption(page, modal(page).getByRole('combobox', { name: /^Objeto/ }), `Contato ${s}`));

  const row = (key: string) => page.getByRole('row').filter({ hasText: key });
  await expect(row(`titulo_${s}`)).toContainText('Sim');
  await expect(row(`prio_${s}`)).toContainText('Seleção (lista)');
  await expect(row(`contato_${s}`)).toContainText('Objeto');

  // Editar: chave bloqueada, muda rótulo e torna obrigatório
  await row(`qtd_${s}`).getByRole('button', { name: 'Editar' }).click();
  await expect(modal(page).getByLabel('Chave')).toBeDisabled();
  await modal(page).getByLabel('Rótulo').fill(`Quantidade ${s}`);
  await modal(page).getByRole('switch').check();
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(row(`qtd_${s}`)).toContainText(`Quantidade ${s}`);
  await expect(row(`qtd_${s}`)).toContainText('Sim');

  // Reordenar: "Contato" acima de "Notas"
  await dragTo(page, row(`contato_${s}`).getByRole('button').first(), row(`notas_${s}`).getByRole('button').first());
  await expect.poll(async () => {
    const fields = (await api.get<any[]>('/api/settings/fields')).filter(f => f.key.endsWith(s)).sort((a, b) => a.position - b.position);
    return fields.map(f => f.key).indexOf(`contato_${s}`) < fields.map(f => f.key).indexOf(`notas_${s}`);
  }).toBe(true);

  // Excluir
  await row(`notas_${s}`).getByRole('button', { name: 'Excluir' }).click();
  await expect(modal(page).getByText(`Notas ${s}`)).toBeVisible();
  await modal(page).getByRole('button', { name: 'Excluir' }).click();
  await expect(row(`notas_${s}`)).toHaveCount(0);
});

test('colunas: cria (inclusive subcampo de objeto), edita, reordena e exclui', async ({ page }) => {
  await openTab(page, 'columns');

  await page.getByRole('button', { name: 'Nova coluna' }).click();
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(modal(page).getByText('Campo é obrigatório')).toBeVisible();
  await modal(page).getByRole('button', { name: 'Cancelar' }).click();

  const create = async (field: string, label: string, sub?: string) => {
    await page.getByRole('button', { name: 'Nova coluna' }).click();
    await pickOption(page, modal(page).getByRole('combobox', { name: /^Campo/ }), field);
    if (sub) await pickOption(page, modal(page).getByRole('combobox', { name: /Subcampo/ }), sub);
    await modal(page).getByLabel('Rótulo da coluna').fill(label);
    await modal(page).getByRole('button', { name: 'Salvar' }).click();
    await expect(modal(page)).toBeHidden();
  };

  await create(`Titulo ${s}`, `Col Titulo ${s}`);
  await create(`Prazo ${s}`, `Col Prazo ${s}`);
  await create(`Contato ${s}`, `Col Contato ${s}`, 'Nome');

  const row = (text: string) => page.getByRole('row').filter({ hasText: text });
  await expect(row(`contato_${s}.nome`)).toBeVisible();

  // Editar rótulo
  await row(`prazo_${s}`).getByRole('button', { name: 'Editar' }).click();
  await modal(page).getByLabel('Rótulo da coluna').fill(`Vencimento ${s}`);
  await modal(page).getByRole('button', { name: 'Salvar' }).click();
  await expect(row(`Vencimento ${s}`)).toBeVisible();

  // Reordenar: Contato antes de Título
  await dragTo(page, row(`contato_${s}`).getByRole('button').first(), row(`titulo_${s}`).getByRole('button').first());
  await expect.poll(async () => {
    const columns = (await api.get<any[]>('/api/settings/columns')).filter(c => c.field_key.endsWith(s)).sort((a, b) => a.position - b.position);
    return columns.map(c => c.field_key);
  }).toEqual([`contato_${s}`, `titulo_${s}`, `prazo_${s}`]);

  // Excluir
  await row(`prazo_${s}`).getByRole('button', { name: 'Excluir' }).click();
  await modal(page).getByRole('button', { name: 'Excluir' }).click();
  await expect(row(`prazo_${s}`)).toHaveCount(0);
});
