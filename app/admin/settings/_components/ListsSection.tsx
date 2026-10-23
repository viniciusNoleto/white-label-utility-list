'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsFor } from '@/src/components/utils/For';
import { UtilsIf } from '@/src/components/utils/If';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import type { AppApiResponse } from '@/src/utils/appClient';
import { getInternalListsService, GET_INTERNAL_LISTS_KEY } from '@/src/resources/internal-list/services/getInternalLists';
import { updateInternalListItemService } from '@/src/resources/internal-list/services/updateInternalListItem';
import { GET_LIST_CONFIG_KEY } from '@/src/resources/list-config/services/getListConfig';
import { useCreateInternalListLogicData, CreateInternalListLogicComponent } from '@/src/resources/internal-list/logics/CreateInternalList';
import { useUpdateInternalListLogicData, UpdateInternalListLogicComponent } from '@/src/resources/internal-list/logics/UpdateInternalList';
import { useDeleteInternalListLogicData, DeleteInternalListLogicComponent } from '@/src/resources/internal-list/logics/DeleteInternalList';
import { CreateInternalListItemInline } from '@/src/resources/internal-list/logics/CreateInternalListItem';
import { useUpdateInternalListItemLogicData, UpdateInternalListItemLogicComponent } from '@/src/resources/internal-list/logics/UpdateInternalListItem';
import { DeleteInternalListItemButton } from '@/src/resources/internal-list/logics/DeleteInternalListItem';
import { EInternalListDisplayStyle } from '@/src/resources/internal-list/enums/InternalListDisplayStyle';
import type { IInternalList, IInternalListItem } from '@/src/resources/internal-list/models/InternalList';

function SortableListItem({ id, children }: { id: number; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-100 dark:border-neutral-800 ${isDragging ? 'relative z-10 shadow-lg' : ''}`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="inline-flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <Icon
          icon="lucide:grip-vertical"
          className="w-4 h-4"
        />
      </button>

      <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

function InternalListDetail({
  list,
  onReorderItems,
  onEditList,
  onDeleteList,
  onEditItem,
  onItemChanged,
}: {
  list: IInternalList;
  onReorderItems: (list: IInternalList, fromIndex: number, toIndex: number) => void;
  onEditList: (list: IInternalList) => void;
  onDeleteList: (list: IInternalList) => void;
  onEditItem: (list: IInternalList, item: IInternalListItem) => void;
  onItemChanged: () => void;
}) {
  const { t } = useTranslation();

  const items = useMemo(() => [...list.items].sort((a, b) => a.position - b.position), [list.items]);
  const itemIds = useMemo(() => items.map(item => item.id), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(active.id as number);
    const newIndex = itemIds.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorderItems(list, oldIndex, newIndex);
  }

  return (
    <div className="flex-1 min-w-0 p-4.5">
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div>
          <div className="font-semibold text-[14.5px]">
            {list.name}
          </div>

          <div className="text-[11.5px] font-mono text-gray-400">
            {t('admin.settings.lists.key.label')}
            {': '}
            {list.key}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FormButton
            variant="subtle"
            color="gray"
            leftIcon="lucide:pencil"
            onClick={() => onEditList(list)}
          >
            {t('admin.settings.lists.actions.edit')}
          </FormButton>

          <FormButton
            variant="subtle"
            color="red"
            leftIcon="lucide:trash-2"
            onClick={() => onDeleteList(list)}
          >
            {t('admin.settings.lists.actions.delete')}
          </FormButton>
        </div>
      </div>

      <CreateInternalListItemInline
        listId={list.id}
        showColor={list.display_style === EInternalListDisplayStyle.BADGE}
        onCreated={onItemChanged}
      />

      <div className="flex flex-col gap-2 mt-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            {t('admin.settings.lists.item.empty')}
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={itemIds}
              strategy={verticalListSortingStrategy}
            >
              <UtilsFor
                each={items}
                eachKey={({ item }) => item.id}
              >
                {({ item: listItem }) => (
                  <SortableListItem id={listItem.id}>
                    {list.display_style === EInternalListDisplayStyle.BADGE ? (
                      <Badge
                        color={listItem.color ?? 'gray'}
                        variant="light"
                        radius="xl"
                      >
                        {listItem.label}
                      </Badge>
                    ) : (
                      <span className="text-sm">
                        {listItem.label}
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <FormButton
                        icon="lucide:pencil"
                        tooltip={t('common.actions.edit')}
                        variant="outline"
                        onClick={() => onEditItem(list, listItem)}
                      />

                      <DeleteInternalListItemButton
                        listId={list.id}
                        itemId={listItem.id}
                        onDeleted={onItemChanged}
                      />
                    </div>
                  </SortableListItem>
                )}
              </UtilsFor>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

export function ListsSection() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editListOpen, setEditListOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingList, setEditingList] = useState<IInternalList | null>(null);
  const [editingItem, setEditingItem] = useState<IInternalListItem | null>(null);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  const {
    data: listsData,
    isFetching: listsIsFetching,
    refetch: listsRefetch,
  } = useQuery({
    queryKey: GET_INTERNAL_LISTS_KEY,
    queryFn: ({ signal }) => getInternalListsService({ signal }),
  });

  const lists = useMemo(() => listsData?.data ?? [], [listsData]);
  const selectedList = useMemo(
    () => lists.find(list => list.id === selectedListId) ?? lists[0] ?? null,
    [lists, selectedListId],
  );

  const reorderItemMutation = useMutation({
    mutationFn: (vars: { listId: number; changes: { itemId: number; position: number }[] }) =>
      Promise.all(vars.changes.map(({ itemId, position }) => updateInternalListItemService({ listId: vars.listId, itemId, body: { position } }))),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: GET_INTERNAL_LISTS_KEY });

      const previousListsData = queryClient.getQueryData<AppApiResponse<IInternalList[]>>(GET_INTERNAL_LISTS_KEY);
      const positionByItemId = new Map(vars.changes.map(({ itemId, position }) => [itemId, position]));

      queryClient.setQueryData<AppApiResponse<IInternalList[]>>(GET_INTERNAL_LISTS_KEY, old => old && ({
        ...old,
        data: old.data.map(list => list.id !== vars.listId ? list : {
          ...list,
          items: list.items.map(item => positionByItemId.has(item.id) ? { ...item, position: positionByItemId.get(item.id)! } : item),
        }),
      }));

      return { previousListsData };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousListsData) {
        queryClient.setQueryData(GET_INTERNAL_LISTS_KEY, context.previousListsData);
      }

      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.lists.notifications.updateError'),
        color: 'red',
      });
    },
    onSettled: () => {
      listsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
    },
  });

  function reorderItems(list: IInternalList, fromIndex: number, toIndex: number) {
    const items = [...list.items].sort((a, b) => a.position - b.position);
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);

    const changes = items
      .map((item, index) => ({ itemId: item.id, position: index, changed: item.position !== index }))
      .filter(change => change.changed)
      .map(({ itemId, position }) => ({ itemId, position }));

    if (changes.length === 0) return;

    reorderItemMutation.mutate({ listId: list.id, changes });
  }

  function handleItemChanged() {
    listsRefetch();
    queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
  }

  const createInternalListLogicData = useCreateInternalListLogicData({
    onSuccess: (createdList) => {
      listsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setSelectedListId(createdList.id);
      setCreateOpen(false);
    },
  });

  const updateInternalListLogicData = useUpdateInternalListLogicData({
    editingInternalListId: editingList?.id ?? 0,
    onSuccess: () => {
      listsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setEditListOpen(false);
    },
  });

  const deleteInternalListLogicData = useDeleteInternalListLogicData({
    listId: editingList?.id ?? 0,
    onSuccess: () => {
      listsRefetch();
      queryClient.invalidateQueries({ queryKey: GET_LIST_CONFIG_KEY });
      setDeleteOpen(false);
    },
  });

  const updateInternalListItemLogicData = useUpdateInternalListItemLogicData({
    listId: editingList?.id ?? 0,
    editingInternalListItemId: editingItem?.id ?? 0,
    onSuccess: () => {
      handleItemChanged();
      setEditItemOpen(false);
    },
  });

  function openCreate() {
    createInternalListLogicData.createInternalListReset();
    setCreateOpen(true);
  }

  function openEditList(list: IInternalList) {
    setEditingList(list);
    updateInternalListLogicData.updateInternalListValidatedFormState.setState(list as any);
    setEditListOpen(true);
  }

  function openDelete(list: IInternalList) {
    setEditingList(list);
    setDeleteOpen(true);
  }

  function openEditItem(list: IInternalList, item: IInternalListItem) {
    setEditingList(list);
    setEditingItem(item);
    updateInternalListItemLogicData.updateInternalListItemValidatedFormState.setState(item as any);
    setEditItemOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.settings.lists.description')}
        </p>

        <FormButton
          color="primary"
          leftIcon="lucide:plus"
          onClick={openCreate}
        >
          {t('admin.settings.lists.actions.new')}
        </FormButton>
      </div>

      <UtilsCard noPadding>
        <UtilsIf condition={lists.length === 0}>
          {() => (
            <p className="p-4.5 text-sm text-gray-400">
              {listsIsFetching ? t('common.loading') : t('admin.settings.lists.table.empty')}
            </p>
          )}
        </UtilsIf>

        <UtilsIf condition={lists.length > 0}>
          {() => (
            <div className="flex min-h-[340px]">
              <div className="w-[212px] shrink-0 border-r border-gray-100 dark:border-neutral-800 p-2.5 flex flex-col gap-1">
                <UtilsFor
                  each={lists}
                  eachKey={({ item }) => item.id}
                >
                  {({ item: list }) => (
                    <button
                      type="button"
                      onClick={() => setSelectedListId(list.id)}
                      className={`text-left px-3 py-2 rounded-lg ${list.id === selectedList?.id ? 'bg-primary-50 dark:bg-primary-950' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
                    >
                      <div className={`text-[13.5px] font-medium ${list.id === selectedList?.id ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                        {list.name}
                      </div>

                      <div className="text-[11.5px] font-mono text-gray-400">
                        {t('admin.settings.lists.item.count', { count: list.items.length })}
                      </div>
                    </button>
                  )}
                </UtilsFor>
              </div>

              {selectedList ? (
                <InternalListDetail
                  list={selectedList}
                  onReorderItems={reorderItems}
                  onEditList={openEditList}
                  onDeleteList={openDelete}
                  onEditItem={openEditItem}
                  onItemChanged={handleItemChanged}
                />
              ) : null}
            </div>
          )}
        </UtilsIf>
      </UtilsCard>

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('admin.settings.lists.modals.create')}
        size="md"
        centered
      >
        <CreateInternalListLogicComponent
          logicData={createInternalListLogicData}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('admin.settings.lists.modals.delete')}
        size="md"
        centered
      >
        {editingList ? (
          <DeleteInternalListLogicComponent
            logicData={deleteInternalListLogicData}
            listName={editingList.name}
            onCancel={() => setDeleteOpen(false)}
          />
        ) : null}
      </Modal>

      <Modal
        opened={editListOpen}
        onClose={() => setEditListOpen(false)}
        title={t('admin.settings.lists.modals.update')}
        size="md"
        centered
      >
        <UpdateInternalListLogicComponent
          logicData={updateInternalListLogicData}
          onCancel={() => setEditListOpen(false)}
        />
      </Modal>

      <Modal
        opened={editItemOpen}
        onClose={() => setEditItemOpen(false)}
        title={t('admin.settings.lists.modals.updateItem')}
        size="md"
        centered
      >
        <UpdateInternalListItemLogicComponent
          logicData={updateInternalListItemLogicData}
          showColor={editingList?.display_style === EInternalListDisplayStyle.BADGE}
          onCancel={() => setEditItemOpen(false)}
        />
      </Modal>
    </div>
  );
}
