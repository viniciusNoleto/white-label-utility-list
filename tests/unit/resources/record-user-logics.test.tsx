import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';
import { renderWithProviders } from '../test-utils';
import { apiError, apiOk } from './logic-helpers';
import { useCreateListRecordLogicData, CreateListRecordLogicComponent } from '@/src/resources/list-record/logics/CreateListRecord';
import { useUpdateListRecordLogicData, UpdateListRecordLogicComponent } from '@/src/resources/list-record/logics/UpdateListRecord';
import { useDeleteListRecordLogicData, DeleteListRecordLogicComponent } from '@/src/resources/list-record/logics/DeleteListRecord';
import { useExportListRecordsLogicData, ExportListRecordsLogicComponent } from '@/src/resources/list-record/logics/ExportListRecords';
import { useApproveUserLogicData, ApproveUserLogicButton } from '@/src/resources/user/logics/ApproveUser';
import { useRejectUserLogicData, RejectUserLogicButton } from '@/src/resources/user/logics/RejectUser';
import { buildListRecordSchema, normalizeListRecordValues } from '@/src/app/(protected)/list/_components/dynamicSchema';
import { formatColumnValue } from '@/src/app/(protected)/list/_components/formatColumnValue';
import { createListRecordService } from '@/src/resources/list-record/services/createListRecord';
import { updateListRecordService } from '@/src/resources/list-record/services/updateListRecord';
import { deleteListRecordService } from '@/src/resources/list-record/services/deleteListRecord';
import { exportListRecordsService } from '@/src/resources/list-record/services/exportListRecords';
import { getListRecordsExportEstimateService } from '@/src/resources/list-record/services/getListRecordsExportEstimate';
import { approveUserService } from '@/src/resources/user/services/approveUser';
import { rejectUserService } from '@/src/resources/user/services/rejectUser';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn(), update: vi.fn() } }));
vi.mock('@/src/resources/list-record/services/createListRecord', () => ({ createListRecordService: vi.fn() }));
vi.mock('@/src/resources/list-record/services/updateListRecord', () => ({ updateListRecordService: vi.fn() }));
vi.mock('@/src/resources/list-record/services/deleteListRecord', () => ({ deleteListRecordService: vi.fn() }));
vi.mock('@/src/resources/list-record/services/exportListRecords', () => ({ exportListRecordsService: vi.fn() }));
vi.mock('@/src/resources/list-record/services/getListRecordsExportEstimate', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getListRecordsExportEstimateService: vi.fn(),
}));
vi.mock('@/src/resources/user/services/approveUser', () => ({ approveUserService: vi.fn() }));
vi.mock('@/src/resources/user/services/rejectUser', () => ({ rejectUserService: vi.fn() }));

const internalLists = [
  { id: 10, key: 'status', name: 'Status', display_style: 'badge', items: [{ id: 1, label: 'Aberto', color: 'blue', position: 0 }] },
  { id: 11, key: 'resp', name: 'Responsáveis', display_style: 'text', items: [{ id: 2, label: 'Ana', color: null, position: 0 }] },
] as any[];

const objects = [{
  id: 20,
  key: 'pessoa',
  name: 'Pessoa',
  fields: [
    { id: 1, key: 'nome', label: 'Nome', type: 'text', required: true, position: 0, internal_list_id: null },
    { id: 2, key: 'idade', label: 'Idade', type: 'number', required: false, position: 1, internal_list_id: null },
  ],
}] as any[];

const field = (overrides: Record<string, any>) => ({ required: false, position: 0, internal_list_id: null, object_id: null, ...overrides });

const fields = [
  field({ id: 1, key: 'titulo', label: 'Título', type: 'text', required: true, position: 0 }),
  field({ id: 2, key: 'descricao', label: 'Descrição', type: 'long_text', position: 1 }),
  field({ id: 3, key: 'prazo', label: 'Prazo', type: 'date', position: 2 }),
  field({ id: 4, key: 'situacao', label: 'Situação', type: 'select', internal_list_id: 10, position: 3 }),
  field({ id: 5, key: 'qtd', label: 'Quantidade', type: 'number', position: 4 }),
  field({ id: 6, key: 'solicitante', label: 'Solicitante', type: 'object', object_id: 20, position: 5 }),
] as any[];

const t = ((key: string, opts?: any) => `${key}:${opts?.label ?? ''}`) as any;

function CreateHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useCreateListRecordLogicData({ fields, objects, onSuccess });

  useEffect(() => {
    logicData.createListRecordReset();
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CreateListRecordLogicComponent
      logicData={logicData}
      fields={fields}
      internalLists={internalLists}
      objects={objects}
      onCancel={() => {}}
    />
  );
}

function UpdateHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useUpdateListRecordLogicData({ recordId: 4, fields, objects, onSuccess });

  useEffect(() => {
    logicData.updateListRecordValidatedFormState.setState({ titulo: 'Antigo', descricao: '', prazo: '2026-01-05', situacao: 'Aberto', qtd: 2, solicitante: { nome: 'Ana', idade: null } });
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UpdateListRecordLogicComponent
      logicData={logicData}
      fields={fields}
      internalLists={internalLists}
      objects={objects}
      onCancel={() => {}}
    />
  );
}

function DeleteHarness({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const logicData = useDeleteListRecordLogicData({ recordId: 4, onSuccess });

  return (
    <DeleteListRecordLogicComponent
      logicData={logicData}
      onCancel={onCancel}
    />
  );
}

function ExportHarness({ filters, onCancel = () => {} }: { filters: { column_id: number; value: string }[]; onCancel?: () => void }) {
  const logicData = useExportListRecordsLogicData({ filters });

  return (
    <ExportListRecordsLogicComponent
      logicData={logicData}
      filterDescriptions={filters.map(filter => ({ label: `Coluna ${filter.column_id}`, value: filter.value }))}
      onCancel={onCancel}
    />
  );
}

function UserButtonsHarness({ onSuccess }: { onSuccess: () => void }) {
  const approve = useApproveUserLogicData({ userId: 2, onSuccess });
  const reject = useRejectUserLogicData({ userId: 2, onSuccess });

  return (
    <>
      <ApproveUserLogicButton logicData={approve} />

      <RejectUserLogicButton logicData={reject} />
    </>
  );
}

describe('dynamicSchema', () => {
  it('builds required rules for scalar and object fields', async () => {
    const schema = buildListRecordSchema(
      [field({ key: 'titulo', label: 'Título', type: 'text', required: true }), field({ key: 'qtd', label: 'Qtd', type: 'number', required: true }), field({ key: 'p', label: 'P', type: 'object', object_id: 20, required: true })] as any,
      objects,
      t,
    );

    const error = await schema.validate({ titulo: '', qtd: null, p: { nome: '' } }, { abortEarly: false }).catch(err => err);

    expect(error.inner.map((e: any) => e.path).sort()).toEqual(['p.nome', 'qtd', 'titulo']);
  });

  it('only requires sub fields of optional objects once something was filled', async () => {
    const schema = buildListRecordSchema([field({ key: 'p', label: 'P', type: 'object', object_id: 20 })] as any, objects, t);

    await expect(schema.validate({ p: { nome: '', idade: null } })).resolves.toBeTruthy();
    await expect(schema.validate({ p: null })).resolves.toEqual({ p: null });

    const error = await schema.validate({ p: { nome: '', idade: 30 } }, { abortEarly: false }).catch(err => err);
    expect(error.inner.map((e: any) => e.path)).toEqual(['p.nome']);
  });

  it('normalizes empty optional objects to null', () => {
    const optionalObject = [field({ key: 'p', label: 'P', type: 'object', object_id: 20 }), field({ key: 'q', label: 'Q', type: 'object', object_id: 20, required: true })] as any;

    expect(normalizeListRecordValues(optionalObject, objects, { p: { nome: '' }, q: { nome: '' } })).toEqual({ p: null, q: { nome: '' } });
    expect(normalizeListRecordValues(optionalObject, objects, { p: { nome: 'Ana' } })).toEqual({ p: { nome: 'Ana' } });
  });
});

describe('formatColumnValue', () => {
  const fieldsByKey = Object.fromEntries(fields.map(f => [f.key, f]));
  const listsById = Object.fromEntries(internalLists.map(l => [l.id, l]));
  const column = (field_key: string, sub_path: string | null = null) => ({ id: 1, label: 'x', field_key, sub_path, position: 0 }) as any;

  it('formats empty, date, nested and plain values', () => {
    expect(formatColumnValue({}, column('titulo'), fieldsByKey, listsById)).toBe('—');
    expect(formatColumnValue({ prazo: '2026-11-10' }, column('prazo'), fieldsByKey, listsById)).toBe('10/11/2026');
    expect(formatColumnValue({ solicitante: { nome: 'Ana' } }, column('solicitante', 'nome'), fieldsByKey, listsById)).toBe('Ana');
    expect(formatColumnValue({ qtd: 5 }, column('qtd'), fieldsByKey, listsById)).toBe('5');
  });

  it('renders badge lists and long text as elements', () => {
    render(
      <MantineProvider>
        {formatColumnValue({ situacao: 'Aberto' }, column('situacao'), fieldsByKey, listsById)}

        {formatColumnValue({ descricao: 'Texto longo' }, column('descricao'), fieldsByKey, listsById)}
      </MantineProvider>,
    );

    expect(screen.getByText('Aberto')).toBeInTheDocument();
    expect(screen.getByText('Texto longo').tagName).toBe('SPAN');
  });
});

describe('list-record logics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CreateListRecord renders a widget per field type, validates and creates', async () => {
    vi.mocked(createListRecordService).mockResolvedValue(apiOk({ id: 1 }, 'Registro criado'));
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<CreateHarness onSuccess={onSuccess} />);

    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Prazo')).toHaveAttribute('type', 'date');
    expect(screen.getByText('Objeto')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('O campo "Título" é obrigatório')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Título', { exact: false }), 'Compra');
    await user.type(screen.getByLabelText('Descrição'), 'Notebooks');
    await user.type(screen.getByLabelText('Prazo'), '2026-11-10');
    await user.click(screen.getByRole('combobox', { name: 'Situação' }));
    await user.click(await screen.findByRole('option', { name: 'Aberto', hidden: true }));
    await user.type(screen.getByLabelText('Quantidade'), '3');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(createListRecordService).toHaveBeenCalledWith({
      body: { values: { titulo: 'Compra', descricao: 'Notebooks', prazo: '2026-11-10', situacao: 'Aberto', qtd: 3, solicitante: null } },
    });
    expect(notifications.show).toHaveBeenCalledWith({ message: 'Registro criado', color: 'green' });
  });

  it('CreateListRecord notifies API errors', async () => {
    vi.mocked(createListRecordService).mockRejectedValue(apiError('Campo inválido'));
    const user = userEvent.setup();
    renderWithProviders(<CreateHarness onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('Título', { exact: false }), 'Compra');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Campo inválido', color: 'red' })));
  });

  it('UpdateListRecord submits the edited values and notifies errors', async () => {
    vi.mocked(updateListRecordService).mockResolvedValueOnce(apiOk({ id: 4 })).mockRejectedValueOnce({});
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<UpdateHarness onSuccess={onSuccess} />);

    const title = screen.getByLabelText('Título', { exact: false });
    await waitFor(() => expect(title).toHaveValue('Antigo'));
    await user.clear(title);
    await user.type(title, 'Novo');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(updateListRecordService).toHaveBeenCalledWith({
      recordId: 4,
      body: { values: expect.objectContaining({ titulo: 'Novo', situacao: 'Aberto', solicitante: { nome: 'Ana', idade: null } }) },
    });

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar o registro.' })));
  });

  it('DeleteListRecord confirms, deletes, cancels and notifies errors', async () => {
    vi.mocked(deleteListRecordService).mockResolvedValueOnce(apiOk(null)).mockRejectedValueOnce({});
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <DeleteHarness
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText(/Tem certeza que deseja excluir este registro/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(deleteListRecordService).toHaveBeenCalledWith({ recordId: 4 });

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível excluir o registro.' })));
  });
});

describe('ExportListRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('explains that everything is exported when there are no filters, estimates and downloads', async () => {
    vi.mocked(getListRecordsExportEstimateService).mockResolvedValue(apiOk({ row_count: 12, column_count: 3, estimated_bytes: 2048 }));
    vi.mocked(exportListRecordsService).mockResolvedValue({ blob: new Blob(['x']), filename: 'lista.xlsx' });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();
    renderWithProviders(<ExportHarness filters={[]} />);

    expect(screen.getByText(/Nenhum filtro válido está definido/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver tamanho estimado' }));
    expect(await screen.findByText('12 registro(s) — tamanho estimado: 2.0 KB')).toBeInTheDocument();
    expect(getListRecordsExportEstimateService).toHaveBeenCalledWith(expect.objectContaining({ query: { filters: [], apply_filters: false } }));

    await user.click(screen.getByRole('button', { name: 'Confirmar e baixar' }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(exportListRecordsService).toHaveBeenCalledWith({ query: { filters: [], apply_filters: false } });
    expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ id: 'export-list-records', loading: true }));
    expect(notifications.update).toHaveBeenCalledWith(expect.objectContaining({ color: 'green', message: 'Download de "lista.xlsx" concluído.' }));
  });

  it('applies the current filters by default and lets the user ignore them', async () => {
    vi.mocked(getListRecordsExportEstimateService).mockResolvedValue(apiOk({ row_count: 1, column_count: 3, estimated_bytes: 100 }));
    vi.mocked(exportListRecordsService).mockRejectedValue(apiError('Falha na exportação'));
    const filters = [{ column_id: 2, value: 'Aberto' }];
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ExportHarness
        filters={filters}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('O filtro atual abaixo será considerado na exportação.')).toBeInTheDocument();
    expect(screen.getByText('Coluna 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver tamanho estimado' }));
    expect(await screen.findByText(/1 registro\(s\)/)).toBeInTheDocument();

    // Alterar o switch descarta a estimativa calculada
    await user.click(screen.getByRole('switch'));
    expect(screen.getByText(/será ignorado/)).toBeInTheDocument();
    expect(screen.queryByText(/1 registro\(s\)/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver tamanho estimado' }));
    await waitFor(() => expect(getListRecordsExportEstimateService).toHaveBeenLastCalledWith(expect.objectContaining({ query: { filters, apply_filters: false } })));

    await user.click(await screen.findByRole('button', { name: 'Confirmar e baixar' }));
    await waitFor(() => expect(notifications.update).toHaveBeenCalledWith(expect.objectContaining({ color: 'red', message: 'Falha na exportação' })));

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('user logics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('approves and rejects users, notifying success and errors', async () => {
    vi.mocked(approveUserService).mockResolvedValueOnce(apiOk({ id: 2 }, 'Usuário aprovado')).mockRejectedValueOnce({});
    vi.mocked(rejectUserService).mockResolvedValueOnce(apiOk({ id: 2 }, 'Usuário rejeitado')).mockRejectedValueOnce({});
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<UserButtonsHarness onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith({ message: 'Usuário aprovado', color: 'green' }));
    expect(approveUserService).toHaveBeenCalledWith({ userId: 2 });

    await user.click(screen.getByRole('button', { name: 'Rejeitar' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith({ message: 'Usuário rejeitado', color: 'green' }));
    expect(rejectUserService).toHaveBeenCalledWith({ userId: 2 });
    expect(onSuccess).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível aprovar o usuário.' })));

    await user.click(screen.getByRole('button', { name: 'Rejeitar' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível rejeitar o usuário.' })));
  });
});

