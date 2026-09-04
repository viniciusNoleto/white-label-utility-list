'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsFor } from '@/src/components/utils/For';
import { FormButton } from '@/src/components/form/Button';
import { getObjectsService, GET_OBJECTS_KEY } from '@/src/resources/object/services/getObjects';
import { getInternalListsService, GET_INTERNAL_LISTS_KEY } from '@/src/resources/internal-list/services/getInternalLists';
import { GET_LIST_CONFIG_KEY } from '@/src/resources/list-config/services/getListConfig';
import { useCreateObjectLogicData, CreateObjectLogicComponent } from '@/src/resources/object/logics/CreateObject';
import { useDeleteObjectLogicData, DeleteObjectLogicComponent } from '@/src/resources/object/logics/DeleteObject';
import { useUpdateObjectPartsLogicData, UpdateObjectPartsLogicComponent } from '@/src/resources/object/logics/UpdateObjectParts';
import type { IObject } from '@/src/resources/object/models/Object';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';

function ObjectRow({
  object,
  isLast,
  internalLists,
  onDeleteObject,
  onPartsChanged,
}: {
  object: IObject;
  isLast: boolean;
  internalLists: IInternalList[];
  onDeleteObject: (object: IObject) => void;
  onPartsChanged: () => void;
}) {
  const { t } = useTranslation();
  const [editPartsOpen, setEditPartsOpen] = useState(false);

  const fields = useMemo(() => [...object.fields].sort((a, b) => a.position - b.position), [object.fields]);

  const updateObjectPartsLogicData = useUpdateObjectPartsLogicData({
    object,
    onSuccess: () => {
      onPartsChanged();
      setEditPartsOpen(false);
    },
  });

  function openEditParts() {
    updateObjectPartsLogicData.updateObjectPartsReset();
    setEditPartsOpen(true);
  }

  return (
    <div className={`p-4.5 ${isLast ? '' : 'border-b border-gray-100 dark:border-neutral-800'}`}>
      <div className="flex items-start justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[15px] text-gray-900 dark:text-gray-100">
              {object.name}
            </span>

            <span className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-mono text-[11px]">
              {object.key}
            </span>
          </div>

          <div className="mt-1 text-xs text-gray-400">
            {t('admin.settings.objects.parts.count', { count: fields.length })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <FormButton
            variant="default"
            onClick={openEditParts}
          >
            {t('admin.settings.objects.parts.actions.edit')}
          </FormButton>

          <FormButton
            icon="lucide:trash-2"
            tooltip={t('admin.settings.objects.actions.delete')}
            variant="subtle"
            color="red"
            onClick={() => onDeleteObject(object)}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {fields.length === 0 ? (
          <span className="text-sm text-gray-400">
            {t('admin.settings.objects.fields.table.empty')}
          </span>
        ) : (
          <UtilsFor
            each={fields}
            eachKey={({ item }) => item.id}
          >
            {({ item: field }) => (
              <div className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 dark:border-neutral-700 rounded-full">
                <span className="text-xs font-medium">
                  {field.label}
                  {field.required ? (
                    <span className="text-red-500">
                      {' *'}
                    </span>
                  ) : null}
                </span>

                <span className="text-[11px] font-mono text-gray-400">
                  {t(`admin.settings.fields.types.${field.type}`)}
                </span>
              </div>
            )}
          </UtilsFor>
        )}
      </div>

      <Modal
        opened={editPartsOpen}
        onClose={() => setEditPartsOpen(false)}
        title={t('admin.settings.objects.modals.editParts', { name: object.name })}
        size="xl"
        centered
      >
        <UpdateObjectPartsLogicComponent
          logicData={updateObjectPartsLogicData}
          internalLists={internalLists}
          onCancel={() => setEditPartsOpen(false)}
        />
      </Modal>
    </div>
  );
}

export function ObjectsSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<IObject | null>(null);

  const {
    data: objectsData,
    isFetching: objectsIsFetching,
    refetch: objectsRefetch,
  } = useQuery({
    queryKey: GET_OBJECTS_KEY,
    queryFn: ({ signal }) => getObjectsService({ signal }),
  });

  const { data: listsData } = useQuery({
    queryKey: GET_INTERNAL_LISTS_KEY,
    queryFn: ({ signal }) => getInternalListsService({ signal }),
  });

  const objects = useMemo(() => objectsData?.data ?? [], [objectsData]);
  const internalLists = useMemo(() => listsData?.data ?? [], [listsData]);

  function handlePartsChanged() {
    objectsRefetch();
    queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
  }

  const createObjectLogicData = useCreateObjectLogicData({
    onSuccess: () => {
      objectsRefetch();
      setCreateOpen(false);
    },
  });

  const deleteObjectLogicData = useDeleteObjectLogicData({
    objectId: editingObject?.id ?? 0,
    onSuccess: () => {
      objectsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setDeleteOpen(false);
    },
  });

  function openCreate() {
    createObjectLogicData.createObjectReset();
    setCreateOpen(true);
  }

  function openDelete(object: IObject) {
    setEditingObject(object);
    setDeleteOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.settings.objects.description')}
        </p>

        <FormButton
          color="primary"
          leftIcon="lucide:plus"
          onClick={openCreate}
        >
          {t('admin.settings.objects.actions.new')}
        </FormButton>
      </div>

      <UtilsCard noPadding>
        {objects.length === 0 ? (
          <p className="p-4.5 text-sm text-gray-400">
            {objectsIsFetching ? t('common.loading') : t('admin.settings.objects.table.empty')}
          </p>
        ) : (
          <UtilsFor
            each={objects}
            eachKey={({ item }) => item.id}
          >
            {({ item: object, index }) => (
              <ObjectRow
                object={object}
                isLast={index === objects.length - 1}
                internalLists={internalLists}
                onDeleteObject={openDelete}
                onPartsChanged={handlePartsChanged}
              />
            )}
          </UtilsFor>
        )}
      </UtilsCard>

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.settings.objects.modals.create')}
        size="lg"
        centered
      >
        <CreateObjectLogicComponent
          logicData={createObjectLogicData}
          internalLists={internalLists}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('admin.settings.objects.modals.delete')}
        size="md"
        centered
      >
        {editingObject ? (
          <DeleteObjectLogicComponent
            logicData={deleteObjectLogicData}
            objectName={editingObject.name}
            onCancel={() => setDeleteOpen(false)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
