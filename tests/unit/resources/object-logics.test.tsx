import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from '../test-utils';
import { apiError, apiOk } from './logic-helpers';
import { useCreateObjectLogicData, CreateObjectLogicComponent } from '@/src/resources/object/logics/CreateObject';
import { useDeleteObjectLogicData, DeleteObjectLogicComponent } from '@/src/resources/object/logics/DeleteObject';
import { useUpdateObjectPartsLogicData, UpdateObjectPartsLogicComponent } from '@/src/resources/object/logics/UpdateObjectParts';
import { createEmptyObjectPart, objectFieldsToPartDrafts, validatePartDrafts } from '@/src/resources/object/logics/ObjectPartsEditor';
import { createObjectService } from '@/src/resources/object/services/createObject';
import { createObjectFieldService } from '@/src/resources/object/services/createObjectField';
import { updateObjectFieldService } from '@/src/resources/object/services/updateObjectField';
import { deleteObjectFieldService } from '@/src/resources/object/services/deleteObjectField';
import { deleteObjectService } from '@/src/resources/object/services/deleteObject';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('@/src/resources/object/services/createObject', () => ({ createObjectService: vi.fn() }));
vi.mock('@/src/resources/object/services/createObjectField', () => ({ createObjectFieldService: vi.fn() }));
vi.mock('@/src/resources/object/services/updateObjectField', () => ({ updateObjectFieldService: vi.fn() }));
vi.mock('@/src/resources/object/services/deleteObjectField', () => ({ deleteObjectFieldService: vi.fn() }));
vi.mock('@/src/resources/object/services/deleteObject', () => ({ deleteObjectService: vi.fn() }));

const internalLists = [{ id: 10, key: 'setores', name: 'Setores', display_style: 'text', items: [] }] as any[];

const object = {
  id: 20,
  key: 'pessoa',
  name: 'Pessoa',
  fields: [
    { id: 2, key: 'email', label: 'E-mail', type: 'text', required: false, position: 1, internal_list_id: null },
    { id: 1, key: 'nome', label: 'Nome', type: 'text', required: true, position: 0, internal_list_id: null },
    { id: 3, key: 'cargo', label: 'Cargo', type: 'text', required: false, position: 2, internal_list_id: null },
  ],
} as any;

const t = (key: string) => key;

function CreateHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useCreateObjectLogicData({ onSuccess });

  useEffect(() => {
    logicData.createObjectReset();
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CreateObjectLogicComponent
      logicData={logicData}
      internalLists={internalLists}
      onCancel={() => {}}
    />
  );
}

function UpdatePartsHarness({ onSuccess }: { onSuccess: () => void }) {
  const logicData = useUpdateObjectPartsLogicData({ object, onSuccess });

  return (
    <UpdateObjectPartsLogicComponent
      logicData={logicData}
      internalLists={internalLists}
      onCancel={() => {}}
    />
  );
}

function DeleteHarness({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const logicData = useDeleteObjectLogicData({ objectId: 20, onSuccess });

  return (
    <DeleteObjectLogicComponent
      logicData={logicData}
      objectName="Pessoa"
      onCancel={onCancel}
    />
  );
}

function partInputs() {
  return {
    labels: screen.queryAllByPlaceholderText('Rótulo'),
    keys: screen.queryAllByPlaceholderText('chave'),
  };
}

describe('ObjectPartsEditor helpers', () => {
  it('createEmptyObjectPart returns unique drafts', () => {
    const a = createEmptyObjectPart();
    const b = createEmptyObjectPart();

    expect(a.localId).not.toBe(b.localId);
    expect(a).toMatchObject({ id: null, key: '', label: '', type: 'text', required: false, internal_list_id: null });
  });

  it('objectFieldsToPartDrafts sorts by position', () => {
    expect(objectFieldsToPartDrafts(object.fields).map(part => part.key)).toEqual(['nome', 'email', 'cargo']);
  });

  it('validatePartDrafts checks label, key, key format and list', () => {
    const base = { ...createEmptyObjectPart(), label: 'Nome', key: 'nome' };

    expect(validatePartDrafts([base], t)).toBeNull();
    expect(validatePartDrafts([{ ...base, label: ' ' }], t)).toBe('admin.settings.objects.parts.validation.labelRequired');
    expect(validatePartDrafts([{ ...base, key: '' }], t)).toBe('admin.settings.objects.parts.validation.keyRequired');
    expect(validatePartDrafts([{ ...base, key: 'Nome X' }], t)).toBe('admin.settings.objects.parts.validation.keyFormat');
    expect(validatePartDrafts([{ ...base, type: 'select' }], t)).toBe('admin.settings.objects.parts.validation.internalListRequired');
  });
});

describe('object logics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CreateObject validates the form and the parts before saving', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateHarness onSuccess={vi.fn()} />);

    expect(screen.getByText(/Adicione a primeira parte/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome do objeto', { exact: false }), 'Pessoa');
    await user.type(screen.getByLabelText('Chave', { exact: false }), 'pessoa');
    await user.click(screen.getByRole('button', { name: 'Parte' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Rótulo é obrigatório')).toBeInTheDocument();
    expect(createObjectService).not.toHaveBeenCalled();
  });

  it('CreateObject creates the object and then each part', async () => {
    vi.mocked(createObjectService).mockResolvedValue(apiOk({ id: 20 }, 'Objeto criado'));
    vi.mocked(createObjectFieldService).mockResolvedValue(apiOk({ id: 1 }));
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<CreateHarness onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText('Nome do objeto', { exact: false }), 'Pessoa');
    await user.type(screen.getByLabelText('Chave', { exact: false }), 'pessoa');

    await user.click(screen.getByRole('button', { name: 'Parte' }));
    await user.type(partInputs().labels[0], 'Nome');
    await user.type(partInputs().keys[0], 'nome');
    await user.click(screen.getAllByRole('button', { name: 'Campo obrigatório' })[0]);

    await user.click(screen.getByRole('button', { name: 'Parte' }));
    await user.type(partInputs().labels[1], 'Setor');
    await user.type(partInputs().keys[1], 'setor');
    await user.click(screen.getAllByRole('combobox')[1]);
    await user.click((await screen.findAllByRole('option', { name: 'Seleção (lista)', hidden: true })).at(-1)!);
    await user.click(screen.getByPlaceholderText('Selecione a lista de opções'));
    await user.click(await screen.findByRole('option', { name: 'Setores', hidden: true }));

    await user.click(screen.getByRole('button', { name: 'Parte' }));
    await user.type(partInputs().labels[2], 'Temp');
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[2]);
    expect(partInputs().labels).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(createObjectService).toHaveBeenCalledWith({ body: { name: 'Pessoa', key: 'pessoa' } });
    expect(createObjectFieldService).toHaveBeenCalledWith({ objectId: 20, body: { key: 'nome', label: 'Nome', type: 'text', required: true, internal_list_id: null } });
    expect(createObjectFieldService).toHaveBeenCalledWith({ objectId: 20, body: { key: 'setor', label: 'Setor', type: 'select', required: false, internal_list_id: 10 } });
    expect(notifications.show).toHaveBeenCalledWith({ message: 'Objeto criado', color: 'green' });
  });

  it('CreateObject notifies API errors', async () => {
    vi.mocked(createObjectService).mockRejectedValue(apiError('Chave já existe'));
    const user = userEvent.setup();
    renderWithProviders(<CreateHarness onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('Nome do objeto', { exact: false }), 'Pessoa');
    await user.type(screen.getByLabelText('Chave', { exact: false }), 'pessoa');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chave já existe', color: 'red' })));
  });

  it('UpdateObjectParts creates, updates (incl. reorder) and deletes only what changed', async () => {
    vi.mocked(createObjectFieldService).mockResolvedValue(apiOk({ id: 9 }));
    vi.mocked(updateObjectFieldService).mockResolvedValue(apiOk({ id: 1 }));
    vi.mocked(deleteObjectFieldService).mockResolvedValue(apiOk(null));
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<UpdatePartsHarness onSuccess={onSuccess} />);

    const { labels, keys } = partInputs();
    expect(labels.map(input => (input as HTMLInputElement).value)).toEqual(['Nome', 'E-mail', 'Cargo']);
    expect(keys[0]).toBeDisabled();

    // Remove "E-mail" (segunda parte)
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[1]);

    // Renomeia "Cargo"
    await user.clear(partInputs().labels[1]);
    await user.type(partInputs().labels[1], 'Função');

    // Nova parte
    await user.click(screen.getByRole('button', { name: 'Parte' }));
    await user.type(partInputs().labels[2], 'Nascimento');
    await user.type(partInputs().keys[2], 'nascimento');

    await user.click(screen.getByRole('button', { name: 'Salvar objeto' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(deleteObjectFieldService).toHaveBeenCalledWith({ objectId: 20, fieldId: 2 });
    expect(updateObjectFieldService).toHaveBeenCalledTimes(1);
    expect(updateObjectFieldService).toHaveBeenCalledWith({
      objectId: 20,
      fieldId: 3,
      body: { label: 'Função', type: 'text', required: false, internal_list_id: null, position: 1 },
    });
    expect(createObjectFieldService).toHaveBeenCalledWith({
      objectId: 20,
      body: { key: 'nascimento', label: 'Nascimento', type: 'text', required: false, internal_list_id: null },
    });
    expect(notifications.show).toHaveBeenCalledWith({ message: 'Partes do objeto atualizadas com sucesso.', color: 'green' });
  });

  it('UpdateObjectParts validates drafts and notifies errors', async () => {
    vi.mocked(updateObjectFieldService).mockRejectedValue({});
    const user = userEvent.setup();
    renderWithProviders(<UpdatePartsHarness onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Parte' }));
    await user.click(screen.getByRole('button', { name: 'Salvar objeto' }));
    expect(await screen.findByText('Rótulo é obrigatório')).toBeInTheDocument();

    // Remove a parte vazia e desmarca "obrigatório" de "Nome"
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[3]);
    await user.click(screen.getAllByRole('button', { name: 'Campo obrigatório' })[0]);
    await user.click(screen.getByRole('button', { name: 'Salvar objeto' }));

    await waitFor(() => expect(updateObjectFieldService).toHaveBeenCalledWith(expect.objectContaining({ fieldId: 1, body: expect.objectContaining({ required: false }) })));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível salvar as partes do objeto.' })));
  });

  it('DeleteObject confirms, deletes, cancels and notifies errors', async () => {
    vi.mocked(deleteObjectService).mockResolvedValueOnce(apiOk(null)).mockRejectedValueOnce({});
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <DeleteHarness
        onSuccess={onSuccess}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText(/excluir o objeto "Pessoa"/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(deleteObjectService).toHaveBeenCalledWith({ objectId: 20 });

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível excluir o objeto.' })));
  });
});
