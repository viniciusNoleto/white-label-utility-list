'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { UtilsTable, UtilsTableDragHandle } from '@/src/components/utils/Table';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import type { AppApiResponse } from '@/src/utils/app-client';
import { getListColumnsService, GET_LIST_COLUMNS_KEY } from '@/src/resources/list-column/services/getListColumns';
import { GET_LIST_CONFIG_KEY } from '@/src/resources/list-config/services/getListConfig';
import { updateListColumnService } from '@/src/resources/list-column/services/updateListColumn';
import { getListFieldsService, GET_LIST_FIELDS_KEY } from '@/src/resources/list-field/services/getListFields';
import { getObjectsService, GET_OBJECTS_KEY } from '@/src/resources/object/services/getObjects';
import { useCreateListColumnLogicData, CreateListColumnLogicComponent } from '@/src/resources/list-column/logics/CreateListColumn';
import { useUpdateListColumnLogicData, UpdateListColumnLogicComponent } from '@/src/resources/list-column/logics/UpdateListColumn';
import { useDeleteListColumnLogicData, DeleteListColumnLogicComponent } from '@/src/resources/list-column/logics/DeleteListColumn';
import type { IListColumn } from '@/src/resources/list-column/models/ListColumn';

export function ColumnsSection() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<IListColumn | null>(null);

  const {
    data: columnsData,
    isFetching: columnsIsFetching,
    refetch: columnsRefetch,
  } = useQuery({
    queryKey: GET_LIST_COLUMNS_KEY,
    queryFn: ({ signal }) => getListColumnsService({ signal }),
  });

  const { data: fieldsData } = useQuery({
    queryKey: GET_LIST_FIELDS_KEY,
    queryFn: ({ signal }) => getListFieldsService({ signal }),
  });

  const { data: objectsData } = useQuery({
    queryKey: GET_OBJECTS_KEY,
    queryFn: ({ signal }) => getObjectsService({ signal }),
  });

  const columns = useMemo(() => [...(columnsData?.data ?? [])].sort((a, b) => a.position - b.position), [columnsData]);
  const fields = useMemo(() => fieldsData?.data ?? [], [fieldsData]);
  const objects = useMemo(() => objectsData?.data ?? [], [objectsData]);

  const reorderMutation = useMutation({
    mutationFn: (changes: { columnId: number; position: number }[]) =>
      Promise.all(changes.map(({ columnId, position }) => updateListColumnService({ columnId, body: { position } }))),
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey: GET_LIST_COLUMNS_KEY });

      const previousColumnsData = queryClient.getQueryData<AppApiResponse<IListColumn[]>>(GET_LIST_COLUMNS_KEY);
      const positionByColumnId = new Map(changes.map(({ columnId, position }) => [columnId, position]));

      queryClient.setQueryData<AppApiResponse<IListColumn[]>>(GET_LIST_COLUMNS_KEY, old => old && ({
        ...old,
        data: old.data.map(column => positionByColumnId.has(column.id) ? { ...column, position: positionByColumnId.get(column.id)! } : column),
      }));

      return { previousColumnsData };
    },
    onError: (err: any, _changes, context) => {
      if (context?.previousColumnsData) {
        queryClient.setQueryData(GET_LIST_COLUMNS_KEY, context.previousColumnsData);
      }

      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.columns.notifications.updateError'),
        color: 'red',
      });
    },
    onSettled: () => {
      columnsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
    },
  });

  function reorderColumns(fromIndex: number, toIndex: number) {
    const reordered = [...columns];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const changes = reordered
      .map((column, index) => ({ columnId: column.id, position: index, changed: column.position !== index }))
      .filter(change => change.changed)
      .map(({ columnId, position }) => ({ columnId, position }));

    if (changes.length === 0) return;

    reorderMutation.mutate(changes);
  }

  const createListColumnLogicData = useCreateListColumnLogicData({
    onSuccess: () => {
      columnsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setCreateOpen(false);
    },
  });

  const updateListColumnLogicData = useUpdateListColumnLogicData({
    columnId: editingColumn?.id ?? 0,
    onSuccess: () => {
      columnsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setUpdateOpen(false);
    },
  });

  const deleteListColumnLogicData = useDeleteListColumnLogicData({
    columnId: editingColumn?.id ?? 0,
    onSuccess: () => {
      columnsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setDeleteOpen(false);
    },
  });

  function openCreate() {
    createListColumnLogicData.createListColumnReset();
    setCreateOpen(true);
  }

  function openUpdate(column: IListColumn) {
    setEditingColumn(column);
    updateListColumnLogicData.updateListColumnValidatedFormState.setState({ label: column.label });
    setUpdateOpen(true);
  }

  function openDelete(column: IListColumn) {
    setEditingColumn(column);
    setDeleteOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.settings.columns.description')}
        </p>

        <FormButton
          color="primary"
          leftIcon="lucide:plus"
          onClick={openCreate}
          disabled={fields.length === 0}
        >
          {t('admin.settings.columns.actions.new')}
        </FormButton>
      </div>

      <UtilsTable
        rows={columns}
        rowKey={({ item }) => item.id}
        loading={columnsIsFetching}
        emptyText={t('admin.settings.columns.table.empty')}
        onReorder={({ index, newIndex }) => reorderColumns(index, newIndex)}
        columns={{
          order: '',
          label: t('admin.settings.columns.table.columns.label'),
          field_key: t('admin.settings.columns.table.columns.field'),
          actions: t('common.table.actionsColumn'),
        }}
        renderCells={{
          field_key: ({ item }) => (
            <span className="font-mono text-[13px] text-gray-500 dark:text-gray-400">
              {item.sub_path ? `${item.field_key}.${item.sub_path}` : item.field_key}
            </span>
          ),
          order: () => (
            <UtilsTableDragHandle />
          ),
          actions: ({ item }) => (
            <div className="flex items-center justify-center gap-1">
              <FormButton
                icon="lucide:pencil"
                tooltip={t('common.actions.edit')}
                variant="outline"
                onClick={() => openUpdate(item)}
              />

              <FormButton
                icon="lucide:trash-2"
                tooltip={t('common.actions.delete')}
                variant="outline"
                color="red"
                onClick={() => openDelete(item)}
              />
            </div>
          ),
        }}
      />

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.settings.columns.modals.create')}
        size="lg"
        centered
      >
        <CreateListColumnLogicComponent
          logicData={createListColumnLogicData}
          fields={fields}
          objects={objects}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        opened={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title={t('admin.settings.columns.modals.update')}
        size="lg"
        centered
      >
        <UpdateListColumnLogicComponent
          logicData={updateListColumnLogicData}
          onCancel={() => setUpdateOpen(false)}
        />
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('admin.settings.columns.modals.delete')}
        size="md"
        centered
      >
        {editingColumn ? (
          <DeleteListColumnLogicComponent
            logicData={deleteListColumnLogicData}
            columnLabel={editingColumn.label}
            onCancel={() => setDeleteOpen(false)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
