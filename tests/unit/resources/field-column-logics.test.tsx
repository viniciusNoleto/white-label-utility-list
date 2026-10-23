import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from '../test-utils';
import { apiError, apiOk } from './logic-helpers';
import { useCreateListFieldLogicData, CreateListFieldLogicComponent } from '@/src/resources/list-field/logics/CreateListField';
import { useUpdateListFieldLogicData, UpdateListFieldLogicComponent } from '@/src/resources/list-field/logics/UpdateListField';
import { useDeleteListFieldLogicData, DeleteListFieldLogicComponent } from '@/src/resources/list-field/logics/DeleteListField';
import { useCreateListColumnLogicData, CreateListColumnLogicComponent } from '@/src/resources/list-column/logics/CreateListColumn';
import { useUpdateListColumnLogicData, UpdateListColumnLogicComponent } from '@/src/resources/list-column/logics/UpdateListColumn';
import { useDeleteListColumnLogicData, DeleteListColumnLogicComponent } from '@/src/resources/list-column/logics/DeleteListColumn';
import { createListFieldService } from '@/src/resources/list-field/services/createListField';
import { updateListFieldService } from '@/src/resources/list-field/services/updateListField';
import { deleteListFieldService } from '@/src/resources/list-field/services/deleteListField';
import { createListColumnService } from '@/src/resources/list-column/services/createListColumn';
import { updateListColumnService } from '@/src/resources/list-column/services/updateListColumn';
import { deleteListColumnService } from '@/src/resources/list-column/services/deleteListColumn';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('@/src/resources/list-field/services/createListField', () => ({ createListFieldService: vi.fn() }));
vi.mock('@/src/resources/list-field/services/updateListField', () => ({ updateListFieldService: vi.fn() }));
vi.mock('@/src/resources/list-field/services/deleteListField', () => ({ deleteListFieldService: vi.fn() }));
vi.mock('@/src/resources/list-column/services/createListColumn', () => ({ createListColumnService: vi.fn() }));
vi.mock('@/src/resources/list-column/services/updateListColumn', () => ({ updateListColumnService: vi.fn() }));
vi.mock('@/src/resources/list-column/services/deleteListColumn', () => ({ deleteListColumnService: vi.fn() }));

const internalLists = [{ id: 10, key: 'status', name: 'Status', display_style: 'badge', items: [] }] as any[];
const objects = [{
  id: 20,
  key: 'pessoa',
  name: 'Pessoa',
  fields: [
    { id: 2, key: 'email', label: 'E-mail', type: 'text', required: false, position: 1, internal_list_id: null },
    { id: 1, key: 'nome', label: 'Nome', type: 'text', required: true, position: 0, internal_list_id: null },
  ],
}] as any[];
const fields = [
  { id: 1, key: 'titulo', label: 'Título', type: 'text', required: true, position: 0, internal_list_id: null, object_id: null },
  { id: 2, key: 'solicitante', label: 'Solicitante', type: 'object', required: false, position: 1, internal_list_id: null, object_id: 20 },
] as any[];

async function choose(user: ReturnType<typeof userEvent.setup>, combobox: RegExp, option: string) {
  await user.click(screen.getByRole('combobox', { name: combobox }));
  await user.click(await screen.findByRole('option', { name: option, hidden: true }));
}

function CreateFieldHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useCreateListFieldLogicData({ onSuccess });

  useEffect(() => {
    logicData.createListFieldReset();
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CreateListFieldLogicComponent
      logicData={logicData}
      internalLists={internalLists}
      objects={objects}
      onCancel={() => {}}
    />
  );
}

function UpdateFieldHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useUpdateListFieldLogicData({ fieldId: 5, onSuccess });

  useEffect(() => {
    logicData.updateListFieldValidatedFormState.setState({ key: 'situacao', label: 'Situação', type: 'select', required: false, internal_list_id: 10, object_id: null });
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UpdateListFieldLogicComponent
      logicData={logicData}
      internalLists={internalLists}
      objects={objects}
      onCancel={() => {}}
    />
  );
}

function DeleteFieldHarness({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const logicData = useDeleteListFieldLogicData({ fieldId: 5, onSuccess });

  return (
    <DeleteListFieldLogicComponent
      logicData={logicData}
      fieldLabel="Situação"
      onCancel={onCancel}
    />
  );
}

function CreateColumnHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useCreateListColumnLogicData({ onSuccess });

  useEffect(() => {
    logicData.createListColumnReset();
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CreateListColumnLogicComponent
      logicData={logicData}
      fields={fields}
      objects={objects}
      onCancel={() => {}}
    />
  );
}

function UpdateColumnHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useUpdateListColumnLogicData({ columnId: 8, onSuccess });

  useEffect(() => {
    logicData.updateListColumnValidatedFormState.setState({ label: 'Título' });
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UpdateListColumnLogicComponent
      logicData={logicData}
      onCancel={() => {}}
    />
  );
}

function DeleteColumnHarness({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const logicData = useDeleteListColumnLogicData({ columnId: 8, onSuccess });

  return (
    <DeleteListColumnLogicComponent
      logicData={logicData}
      columnLabel="Título"
      onCancel={onCancel}
    />
  );
}

describe('list-field logics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CreateListField validates and creates a required text field', async () => {
    vi.mocked(createListFieldService).mockResolvedValue(apiOk({ id: 1 }, 'Campo criado'));
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<CreateFieldHarness onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Rótulo é obrigatório')).toBeInTheDocument();
    expect(createListFieldService).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Rótulo', { exact: false }), 'Título');
    await user.type(screen.getByLabelText('Chave', { exact: false }), 'titulo');
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(createListFieldService).toHaveBeenCalledWith({
      body: { key: 'titulo', label: 'Título', type: 'text', required: true, internal_list_id: null, object_id: null },
    });
    expect(notifications.show).toHaveBeenCalledWith({ message: 'Campo criado', color: 'green' });
  });

  it('CreateListField shows the list select for "select" and sends internal_list_id', async () => {
    vi.mocked(createListFieldService).mockResolvedValue(apiOk({ id: 1 }));
    const user = userEvent.setup();
    renderWithProviders(<CreateFieldHarness onSuccess={vi.fn()} />);

    expect(screen.queryByRole('combobox', { name: /^Lista/ })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Rótulo', { exact: false }), 'Situação');
    await user.type(screen.getByLabelText('Chave', { exact: false }), 'situacao');
    await choose(user, /^Tipo/, 'Seleção (lista)');
    await choose(user, /^Lista/, 'Status');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(createListFieldService).toHaveBeenCalledWith({
      body: { key: 'situacao', label: 'Situação', type: 'select', required: false, internal_list_id: 10, object_id: null },
    }));
  });

  it('CreateListField shows the object select for "object" and notifies errors', async () => {
    vi.mocked(createListFieldService).mockRejectedValue(apiError('Chave duplicada'));
    const user = userEvent.setup();
    renderWithProviders(<CreateFieldHarness onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('Rótulo', { exact: false }), 'Solicitante');
    await user.type(screen.getByLabelText('Chave', { exact: false }), 'solicitante');
    await choose(user, /^Tipo/, 'Objeto');
    await choose(user, /^Objeto/, 'Pessoa');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(createListFieldService).toHaveBeenCalledWith({
      body: { key: 'solicitante', label: 'Solicitante', type: 'object', required: false, internal_list_id: null, object_id: 20 },
    }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chave duplicada', color: 'red' })));
  });

  it('UpdateListField keeps the key disabled and clears internal_list_id when type changes', async () => {
    vi.mocked(updateListFieldService).mockResolvedValue(apiOk({ id: 5 }));
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<UpdateFieldHarness onSuccess={onSuccess} />);

    const key = screen.getByLabelText('Chave', { exact: false });
    await waitFor(() => expect(key).toHaveValue('situacao'));
    expect(key).toBeDisabled();

    await choose(user, /^Tipo/, 'Texto curto');
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(updateListFieldService).toHaveBeenCalledWith({
      fieldId: 5,
      body: { label: 'Situação', type: 'text', required: true, internal_list_id: null, object_id: null },
    });
  });

  it('UpdateListField falls back to the default error message', async () => {
    vi.mocked(updateListFieldService).mockRejectedValue({});
    const user = userEvent.setup();
    renderWithProviders(<UpdateFieldHarness onSuccess={vi.fn()} />);

    await waitFor(() => expect(screen.getByLabelText('Rótulo', { exact: false })).toHaveValue('Situação'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar o campo.' })));
  });

  it('DeleteListField confirms, deletes, cancels and notifies errors', async () => {
    vi.mocked(deleteListFieldService).mockResolvedValueOnce(apiOk(null)).mockRejectedValueOnce({});
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <DeleteFieldHarness
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText(/excluir o campo "Situação"/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(deleteListFieldService).toHaveBeenCalledWith({ fieldId: 5 });

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível excluir o campo.' })));
  });
});

describe('list-column logics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CreateListColumn validates and creates a simple column', async () => {
    vi.mocked(createListColumnService).mockResolvedValue(apiOk({ id: 1 }));
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<CreateColumnHarness onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Campo é obrigatório')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Subcampo/ })).not.toBeInTheDocument();

    await choose(user, /^Campo/, 'Título');
    await user.type(screen.getByLabelText('Rótulo da coluna', { exact: false }), 'Título');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(createListColumnService).toHaveBeenCalledWith({ body: { field_key: 'titulo', sub_path: null, label: 'Título' } });
  });

  it('CreateListColumn asks for the sub field of object fields, sorted by position', async () => {
    vi.mocked(createListColumnService).mockRejectedValue(apiError('Coluna já existe'));
    const user = userEvent.setup();
    renderWithProviders(<CreateColumnHarness onSuccess={vi.fn()} />);

    await choose(user, /^Campo/, 'Solicitante');
    await user.click(screen.getByRole('combobox', { name: /Subcampo/ }));

    const listbox = await screen.findByRole('listbox', { name: /Subcampo/, hidden: true });
    const options = within(listbox).getAllByRole('option', { hidden: true });
    expect(options.map(option => option.textContent)).toEqual(['Nome', 'E-mail']);

    await user.click(options[0]);
    await user.type(screen.getByLabelText('Rótulo da coluna', { exact: false }), 'Solicitante');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(createListColumnService).toHaveBeenCalledWith({ body: { field_key: 'solicitante', sub_path: 'nome', label: 'Solicitante' } }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Coluna já existe', color: 'red' })));
  });

  it('UpdateListColumn updates the label and notifies errors', async () => {
    vi.mocked(updateListColumnService).mockResolvedValueOnce(apiOk({ id: 8 })).mockRejectedValueOnce({});
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<UpdateColumnHarness onSuccess={onSuccess} />);

    const label = screen.getByLabelText('Rótulo da coluna', { exact: false });
    await waitFor(() => expect(label).toHaveValue('Título'));

    await user.clear(label);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Rótulo é obrigatório')).toBeInTheDocument();

    await user.type(label, 'Nome');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(updateListColumnService).toHaveBeenCalledWith({ columnId: 8, body: { label: 'Nome' } });

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar a coluna.' })));
  });

  it('DeleteListColumn confirms, deletes, cancels and notifies errors', async () => {
    vi.mocked(deleteListColumnService).mockResolvedValueOnce(apiOk(null)).mockRejectedValueOnce(apiError('Erro coluna'));
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <DeleteColumnHarness
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText(/excluir a coluna "Título"/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(deleteListColumnService).toHaveBeenCalledWith({ columnId: 8 });

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro coluna', color: 'red' })));
  });
});
