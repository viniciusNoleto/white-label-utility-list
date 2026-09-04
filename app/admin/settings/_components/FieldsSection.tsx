'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { UtilsTable, UtilsTableDragHandle } from '@/src/components/utils/Table';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import type { AppApiResponse } from '@/src/utils/app-client';
import { getListFieldsService, GET_LIST_FIELDS_KEY } from '@/src/resources/list-field/services/getListFields';
import { getInternalListsService, GET_INTERNAL_LISTS_KEY } from '@/src/resources/internal-list/services/getInternalLists';
import { getObjectsService, GET_OBJECTS_KEY } from '@/src/resources/object/services/getObjects';
import { GET_LIST_CONFIG_KEY } from '@/src/resources/list-config/services/getListConfig';
import { updateListFieldService } from '@/src/resources/list-field/services/updateListField';
import { useCreateListFieldLogicData, CreateListFieldLogicComponent } from '@/src/resources/list-field/logics/CreateListField';
import { useUpdateListFieldLogicData, UpdateListFieldLogicComponent } from '@/src/resources/list-field/logics/UpdateListField';
import { useDeleteListFieldLogicData, DeleteListFieldLogicComponent } from '@/src/resources/list-field/logics/DeleteListField';
import type { IListField } from '@/src/resources/list-field/models/ListField';

export function FieldsSection() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingField, setEditingField] = useState<IListField | null>(null);

  const {
    data: fieldsData,
    isFetching: fieldsIsFetching,
    refetch: fieldsRefetch,
  } = useQuery({
    queryKey: GET_LIST_FIELDS_KEY,
    queryFn: ({ signal }) => getListFieldsService({ signal }),
  });

  const { data: listsData } = useQuery({
    queryKey: GET_INTERNAL_LISTS_KEY,
    queryFn: ({ signal }) => getInternalListsService({ signal }),
  });

  const { data: objectsData } = useQuery({
    queryKey: GET_OBJECTS_KEY,
    queryFn: ({ signal }) => getObjectsService({ signal }),
  });

  const fields = useMemo(() => [...(fieldsData?.data ?? [])].sort((a, b) => a.position - b.position), [fieldsData]);
  const internalLists = useMemo(() => listsData?.data ?? [], [listsData]);
  const objects = useMemo(() => objectsData?.data ?? [], [objectsData]);

  const reorderMutation = useMutation({
    mutationFn: (changes: { fieldId: number; position: number }[]) =>
      Promise.all(changes.map(({ fieldId, position }) => updateListFieldService({ fieldId, body: { position } }))),
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey: GET_LIST_FIELDS_KEY });

      const previousFieldsData = queryClient.getQueryData<AppApiResponse<IListField[]>>(GET_LIST_FIELDS_KEY);
      const positionByFieldId = new Map(changes.map(({ fieldId, position }) => [fieldId, position]));

      queryClient.setQueryData<AppApiResponse<IListField[]>>(GET_LIST_FIELDS_KEY, old => old && ({
        ...old,
        data: old.data.map(field => positionByFieldId.has(field.id) ? { ...field, position: positionByFieldId.get(field.id)! } : field),
      }));

      return { previousFieldsData };
    },
    onError: (err: any, _changes, context) => {
      if (context?.previousFieldsData) {
        queryClient.setQueryData(GET_LIST_FIELDS_KEY, context.previousFieldsData);
      }

      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.fields.notifications.updateError'),
        color: 'red',
      });
    },
    onSettled: () => {
      fieldsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
    },
  });

  function reorderFields(fromIndex: number, toIndex: number) {
    const reordered = [...fields];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const changes = reordered
      .map((field, index) => ({ fieldId: field.id, position: index, changed: field.position !== index }))
      .filter(change => change.changed)
      .map(({ fieldId, position }) => ({ fieldId, position }));

    if (changes.length === 0) return;

    reorderMutation.mutate(changes);
  }

  const createListFieldLogicData = useCreateListFieldLogicData({
    onSuccess: () => {
      fieldsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setCreateOpen(false);
    },
  });

  const updateListFieldLogicData = useUpdateListFieldLogicData({
    fieldId: editingField?.id ?? 0,
    onSuccess: () => {
      fieldsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setUpdateOpen(false);
    },
  });

  const deleteListFieldLogicData = useDeleteListFieldLogicData({
    fieldId: editingField?.id ?? 0,
    onSuccess: () => {
      fieldsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setDeleteOpen(false);
    },
  });

  function openCreate() {
    createListFieldLogicData.createListFieldReset();
    setCreateOpen(true);
  }

  function openUpdate(field: IListField) {
    setEditingField(field);
    updateListFieldLogicData.updateListFieldValidatedFormState.setState(field as any);
    setUpdateOpen(true);
  }

  function openDelete(field: IListField) {
    setEditingField(field);
    setDeleteOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.settings.fields.description')}
        </p>

        <FormButton
          color="primary"
          leftIcon="lucide:plus"
          onClick={openCreate}
        >
          {t('admin.settings.fields.actions.new')}
        </FormButton>
      </div>

      <UtilsTable
        rows={fields}
        rowKey={({ item }) => item.id}
        loading={fieldsIsFetching}
        emptyText={t('admin.settings.fields.table.empty')}
        onReorder={({ index, newIndex }) => reorderFields(index, newIndex)}
        columns={{
          order: '',
          label: t('admin.settings.fields.table.columns.label'),
          key: t('admin.settings.fields.table.columns.key'),
          type: t('admin.settings.fields.table.columns.type'),
          required: t('admin.settings.fields.table.columns.required'),
          actions: t('common.table.actionsColumn'),
        }}
        renderCells={{
          key: ({ item }) => (
            <span className="font-mono text-[13px] text-gray-500 dark:text-gray-400">
              {item.key}
            </span>
          ),
          type: ({ item }) => (
            <Badge
              color="gray"
              variant="light"
              radius="xl"
            >
              {t(`admin.settings.fields.types.${item.type}`)}
            </Badge>
          ),
          required: ({ item }) => (
            item.required ? (
              <Badge
                color="primary"
                radius="xl"
              >
                {t('common.words.yes')}
              </Badge>
            ) : (
              <span className="text-gray-400">
                {t('common.words.no')}
              </span>
            )
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
        title={t('admin.settings.fields.modals.create')}
        size="lg"
        centered
      >
        <CreateListFieldLogicComponent
          logicData={createListFieldLogicData}
          internalLists={internalLists}
          objects={objects}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        opened={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title={t('admin.settings.fields.modals.update')}
        size="lg"
        centered
      >
        <UpdateListFieldLogicComponent
          logicData={updateListFieldLogicData}
          internalLists={internalLists}
          objects={objects}
          onCancel={() => setUpdateOpen(false)}
        />
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('admin.settings.fields.modals.delete')}
        size="md"
        centered
      >
        {editingField ? (
          <DeleteListFieldLogicComponent
            logicData={deleteListFieldLogicData}
            fieldLabel={editingField.label}
            onCancel={() => setDeleteOpen(false)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
