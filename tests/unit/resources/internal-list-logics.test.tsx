import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from '../test-utils';
import { apiError, apiOk } from './logic-helpers';
import { useCreateInternalListLogicData, CreateInternalListLogicComponent } from '@/src/resources/internal-list/logics/CreateInternalList';
import { useUpdateInternalListLogicData, UpdateInternalListLogicComponent } from '@/src/resources/internal-list/logics/UpdateInternalList';
import { useDeleteInternalListLogicData, DeleteInternalListLogicComponent } from '@/src/resources/internal-list/logics/DeleteInternalList';
import { CreateInternalListItemInline } from '@/src/resources/internal-list/logics/CreateInternalListItem';
import { useUpdateInternalListItemLogicData, UpdateInternalListItemLogicComponent } from '@/src/resources/internal-list/logics/UpdateInternalListItem';
import { DeleteInternalListItemButton } from '@/src/resources/internal-list/logics/DeleteInternalListItem';
import { createInternalListService } from '@/src/resources/internal-list/services/createInternalList';
import { updateInternalListService } from '@/src/resources/internal-list/services/updateInternalList';
import { deleteInternalListService } from '@/src/resources/internal-list/services/deleteInternalList';
import { createInternalListItemService } from '@/src/resources/internal-list/services/createInternalListItem';
import { updateInternalListItemService } from '@/src/resources/internal-list/services/updateInternalListItem';
import { deleteInternalListItemService } from '@/src/resources/internal-list/services/deleteInternalListItem';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('@/src/resources/internal-list/services/createInternalList', () => ({ createInternalListService: vi.fn() }));
vi.mock('@/src/resources/internal-list/services/updateInternalList', () => ({ updateInternalListService: vi.fn() }));
vi.mock('@/src/resources/internal-list/services/deleteInternalList', () => ({ deleteInternalListService: vi.fn() }));
vi.mock('@/src/resources/internal-list/services/createInternalListItem', () => ({ createInternalListItemService: vi.fn() }));
vi.mock('@/src/resources/internal-list/services/updateInternalListItem', () => ({ updateInternalListItemService: vi.fn() }));
vi.mock('@/src/resources/internal-list/services/deleteInternalListItem', () => ({ deleteInternalListItemService: vi.fn() }));

const list = { id: 3, key: 'status', name: 'Status', display_style: 'badge', items: [] };

function CreateHarness({ onSuccess, onCancel = () => {} }: { onSuccess: (l: any) => void; onCancel?: () => void }) {
  const logicData = useCreateInternalListLogicData({ onSuccess });

  useEffect(() => {
    logicData.createInternalListReset();
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CreateInternalListLogicComponent
      logicData={logicData}
      onCancel={onCancel}
    />
  );
}

function UpdateHarness({ onSuccess }: { onSuccess: (l: any) => void }) {
  const logicData = useUpdateInternalListLogicData({ editingInternalListId: 3, onSuccess });

  useEffect(() => {
    logicData.updateInternalListValidatedFormState.setState({ name: 'Status', display_style: 'text' } as any);
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UpdateInternalListLogicComponent
      logicData={logicData}
      onCancel={() => {}}
    />
  );
}

function DeleteHarness({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const logicData = useDeleteInternalListLogicData({ listId: 3, onSuccess });

  return (
    <DeleteInternalListLogicComponent
      logicData={logicData}
      listName="Status"
      onCancel={onCancel}
    />
  );
}

function UpdateItemHarness({ onSuccess, showColor }: { onSuccess: (i: any) => void; showColor: boolean }) {
  const logicData = useUpdateInternalListItemLogicData({ listId: 3, editingInternalListItemId: 7, onSuccess });

  useEffect(() => {
    logicData.updateInternalListItemValidatedFormState.setState({ label: 'Aberto', color: null } as any);
    // Executa apenas na montagem, como o pai faz ao abrir o modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UpdateInternalListItemLogicComponent
      logicData={logicData}
      showColor={showColor}
      onCancel={() => {}}
    />
  );
}

describe('internal-list logics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CreateInternalList', () => {
    it('validates required fields and key format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateHarness onSuccess={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByLabelText('Chave', { exact: false })).toHaveAttribute('aria-invalid', 'true');

      await user.type(screen.getByLabelText('Chave', { exact: false }), 'Chave Inválida');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      expect(await screen.findByText('Use apenas letras minúsculas, números e "_"')).toBeInTheDocument();
      expect(createInternalListService).not.toHaveBeenCalled();
    });

    it('creates the list with the chosen display style', async () => {
      vi.mocked(createInternalListService).mockResolvedValue(apiOk(list, 'Lista criada'));
      const onSuccess = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(<CreateHarness onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText('Nome da lista', { exact: false }), 'Status');
      await user.type(screen.getByLabelText('Chave', { exact: false }), 'status');
      await user.click(screen.getByRole('combobox', { name: /Estilo de exibição/ }));
      await user.click(await screen.findByRole('option', { name: 'Badge', hidden: true }));
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(list));
      expect(createInternalListService).toHaveBeenCalledWith({ body: { name: 'Status', key: 'status', display_style: 'badge' } });
      expect(notifications.show).toHaveBeenCalledWith({ message: 'Lista criada', color: 'green' });
    });

    it('shows the API error message on failure and calls onCancel', async () => {
      vi.mocked(createInternalListService).mockRejectedValue(apiError('Chave já existe'));
      const onCancel = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <CreateHarness
          onSuccess={vi.fn()}
          onCancel={onCancel}
        />,
      );

      await user.type(screen.getByLabelText('Nome da lista', { exact: false }), 'Status');
      await user.type(screen.getByLabelText('Chave', { exact: false }), 'status');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chave já existe', color: 'red' })));

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('UpdateInternalList', () => {
    it('submits the prefilled state', async () => {
      vi.mocked(updateInternalListService).mockResolvedValue(apiOk(list));
      const onSuccess = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(<UpdateHarness onSuccess={onSuccess} />);

      const name = screen.getByLabelText('Nome da lista', { exact: false });
      await waitFor(() => expect(name).toHaveValue('Status'));
      await user.clear(name);
      await user.type(name, 'Situações');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(list));
      expect(updateInternalListService).toHaveBeenCalledWith({ listId: 3, body: { name: 'Situações', display_style: 'text' } });
    });

    it('falls back to the default error message', async () => {
      vi.mocked(updateInternalListService).mockRejectedValue({});
      const user = userEvent.setup();
      renderWithProviders(<UpdateHarness onSuccess={vi.fn()} />);

      await waitFor(() => expect(screen.getByLabelText('Nome da lista', { exact: false })).toHaveValue('Status'));
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível atualizar a lista.' })));
    });
  });

  describe('DeleteInternalList', () => {
    it('shows the confirmation, deletes and supports cancel', async () => {
      vi.mocked(deleteInternalListService).mockResolvedValue(apiOk(null));
      const onSuccess = vi.fn();
      const onCancel = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <DeleteHarness
          onSuccess={onSuccess}
          onCancel={onCancel}
        />,
      );

      expect(screen.getByText(/excluir a lista "Status"/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onCancel).toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Excluir' }));
      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
      expect(deleteInternalListService).toHaveBeenCalledWith({ listId: 3 });
    });

    it('notifies on error', async () => {
      vi.mocked(deleteInternalListService).mockRejectedValue(apiError('Lista em uso'));
      const user = userEvent.setup();
      renderWithProviders(
        <DeleteHarness
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Excluir' }));
      await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Lista em uso', color: 'red' })));
    });
  });

  describe('CreateInternalListItemInline', () => {
    it('keeps the add button disabled until a label is typed and sends no color for text lists', async () => {
      vi.mocked(createInternalListItemService).mockResolvedValue(apiOk({ id: 1 }));
      const onCreated = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <CreateInternalListItemInline
          listId={3}
          showColor={false}
          onCreated={onCreated}
        />,
      );

      const add = screen.getByRole('button', { name: 'Adicionar' });
      expect(add).toBeDisabled();
      expect(screen.queryByRole('combobox', { name: /Cor/ })).not.toBeInTheDocument();

      const input = screen.getByLabelText('Novo item');
      await user.type(input, 'Aberto');
      await user.click(add);

      await waitFor(() => expect(onCreated).toHaveBeenCalled());
      expect(createInternalListItemService).toHaveBeenCalledWith({ listId: 3, body: { label: 'Aberto', color: null } });
      expect(input).toHaveValue('');
    });

    it('sends the selected color for badge lists', async () => {
      vi.mocked(createInternalListItemService).mockResolvedValue(apiOk({ id: 1 }));
      const user = userEvent.setup();
      renderWithProviders(
        <CreateInternalListItemInline
          listId={3}
          showColor
          onCreated={vi.fn()}
        />,
      );

      await user.type(screen.getByLabelText('Novo item'), 'Concluído');
      await user.click(screen.getByRole('combobox', { name: /Cor/ }));
      await user.click(await screen.findByRole('option', { name: 'Verde', hidden: true }));
      await user.click(screen.getByRole('button', { name: 'Adicionar' }));

      await waitFor(() => expect(createInternalListItemService).toHaveBeenCalledWith({ listId: 3, body: { label: 'Concluído', color: 'green' } }));
    });

    it('notifies on error', async () => {
      vi.mocked(createInternalListItemService).mockRejectedValue({});
      const user = userEvent.setup();
      renderWithProviders(
        <CreateInternalListItemInline
          listId={3}
          showColor={false}
          onCreated={vi.fn()}
        />,
      );

      await user.type(screen.getByLabelText('Novo item'), 'X');
      await user.click(screen.getByRole('button', { name: 'Adicionar' }));

      await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível adicionar o item.' })));
    });
  });

  describe('UpdateInternalListItem', () => {
    it('hides the color select for text lists and updates the label', async () => {
      vi.mocked(updateInternalListItemService).mockResolvedValue(apiOk({ id: 7 }));
      const onSuccess = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <UpdateItemHarness
          onSuccess={onSuccess}
          showColor={false}
        />,
      );

      expect(screen.queryByRole('combobox', { name: /Cor/ })).not.toBeInTheDocument();

      const input = screen.getByLabelText('Novo item', { exact: false });
      await waitFor(() => expect(input).toHaveValue('Aberto'));
      await user.clear(input);
      await user.click(screen.getByRole('button', { name: 'Salvar' }));
      expect(await screen.findByText('Rótulo é obrigatório')).toBeInTheDocument();

      await user.type(input, 'Em aberto');
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
      expect(updateInternalListItemService).toHaveBeenCalledWith({ listId: 3, itemId: 7, body: { label: 'Em aberto', color: null } });
    });

    it('updates the color for badge lists and notifies on error', async () => {
      vi.mocked(updateInternalListItemService).mockRejectedValue(apiError('Erro no item'));
      const user = userEvent.setup();
      renderWithProviders(
        <UpdateItemHarness
          onSuccess={vi.fn()}
          showColor
        />,
      );

      await waitFor(() => expect(screen.getByLabelText('Novo item', { exact: false })).toHaveValue('Aberto'));
      await user.click(screen.getByRole('combobox', { name: /Cor/ }));
      await user.click(await screen.findByRole('option', { name: 'Azul', hidden: true }));
      await user.click(screen.getByRole('button', { name: 'Salvar' }));

      await waitFor(() => expect(updateInternalListItemService).toHaveBeenCalledWith({ listId: 3, itemId: 7, body: { label: 'Aberto', color: 'blue' } }));
      await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro no item', color: 'red' })));
    });
  });

  describe('DeleteInternalListItemButton', () => {
    it('deletes the item and notifies errors', async () => {
      vi.mocked(deleteInternalListItemService).mockResolvedValueOnce(apiOk(null)).mockRejectedValueOnce({});
      const onDeleted = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <DeleteInternalListItemButton
          listId={3}
          itemId={7}
          onDeleted={onDeleted}
        />,
      );

      await user.click(screen.getByRole('button'));
      await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
      expect(deleteInternalListItemService).toHaveBeenCalledWith({ listId: 3, itemId: 7 });

      await user.click(screen.getByRole('button'));
      await waitFor(() => expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Não foi possível remover o item.' })));
    });
  });
});
