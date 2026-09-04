'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsFor } from '@/src/components/utils/For';
import { UtilsIf } from '@/src/components/utils/If';
import { UtilsTable } from '@/src/components/utils/Table';
import { FormButton } from '@/src/components/form/Button';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormSelect } from '@/src/components/form/Select';
import { useImmediateState } from '@/src/utils/state';
import { useDebouncedEffect } from '@/src/utils/hooks';
import { getListConfigService, GET_LIST_CONFIG_KEY } from '@/src/resources/list-config/services/getListConfig';
import { getListRecordsService, GET_LIST_RECORDS_KEY, type GetListRecordsServiceFilter } from '@/src/resources/list-record/services/getListRecords';
import { useCreateListRecordLogicData, CreateListRecordLogicComponent } from '@/src/resources/list-record/logics/CreateListRecord';
import { useUpdateListRecordLogicData, UpdateListRecordLogicComponent } from '@/src/resources/list-record/logics/UpdateListRecord';
import { useDeleteListRecordLogicData, DeleteListRecordLogicComponent } from '@/src/resources/list-record/logics/DeleteListRecord';
import { formatColumnValue } from './_components/formatColumnValue';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';
import type { IListRecord } from '@/src/resources/list-record/models/ListRecord';
import type { IListColumn } from '@/src/resources/list-column/models/ListColumn';
import type { IListField } from '@/src/resources/list-field/models/ListField';
import type { IObject } from '@/src/resources/object/models/Object';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';
import type { PaginatedMeta } from '@/src/shared/types/api';

const PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

type ListFilterRow = {
  id: string;
  columnId: string;
  value: string;
};

function createEmptyFilterRow(): ListFilterRow {
  return { id: crypto.randomUUID(), columnId: '', value: '' };
}

function parseFiltersParam(raw: string | null): ListFilterRow[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is { column_id: string; value: string } => !!item && typeof item.column_id === 'string')
      .map(item => ({ id: crypto.randomUUID(), columnId: item.column_id, value: typeof item.value === 'string' ? item.value : '' }));
  } catch {
    return [];
  }
}

function getColumnInternalList(
  column: IListColumn | undefined,
  fieldsByKey: Record<string, IListField>,
  objectsById: Record<number, IObject>,
  internalListsById: Record<number, IInternalList>,
): IInternalList | null {
  if (!column) return null;

  const field = fieldsByKey[column.field_key];
  if (!field) return null;

  if (!column.sub_path) {
    if (field.type !== EListFieldType.SELECT || !field.internal_list_id) return null;

    return internalListsById[field.internal_list_id] ?? null;
  }

  if (field.type !== EListFieldType.OBJECT || !field.object_id) return null;

  const subField = objectsById[field.object_id]?.fields.find(objectField => objectField.key === column.sub_path);

  if (!subField || subField.type !== EListFieldType.SELECT || !subField.internal_list_id) return null;

  return internalListsById[subField.internal_list_id] ?? null;
}

export default function ListaPage() {
  return (
    <Suspense fallback={null}>
      <ListaPageContent />
    </Suspense>
  );
}

function ListaPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get('page')) || 1;
  const initialPerPageParam = Number(searchParams.get('per_page'));
  const initialPerPage = PER_PAGE_OPTIONS.includes(initialPerPageParam) ? initialPerPageParam : PER_PAGE_OPTIONS[0];
  const initialFilterRows = parseFiltersParam(searchParams.get('filters'));

  const [page, setPage] = useImmediateState(initialPage);
  const [perPage, setPerPage] = useImmediateState(initialPerPage);
  const [filterRows, setFilterRows] = useState<ListFilterRow[]>(() => initialFilterRows.length > 0 ? initialFilterRows : [createEmptyFilterRow()]);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IListRecord | null>(null);

  const { data: configData } = useQuery({
    queryKey: GET_LIST_CONFIG_KEY,
    queryFn: ({ signal }) => getListConfigService({ signal }),
  });

  const fields = useMemo(() => configData?.data.fields ?? [], [configData]);
  const columns = useMemo(() => [...(configData?.data.columns ?? [])].sort((a, b) => a.position - b.position), [configData]);
  const internalLists = useMemo(() => configData?.data.internal_lists ?? [], [configData]);
  const objects = useMemo(() => configData?.data.objects ?? [], [configData]);
  const fieldsByKey = useMemo(() => Object.fromEntries(fields.map(f => [f.key, f])), [fields]);
  const internalListsById = useMemo(() => Object.fromEntries(internalLists.map(l => [l.id, l])), [internalLists]);
  const objectsById = useMemo(() => Object.fromEntries(objects.map(o => [o.id, o])), [objects]);
  const columnsById = useMemo(() => Object.fromEntries(columns.map(c => [c.id, c])), [columns]);

  const activeFilters = useMemo(
    () => filterRows
      .filter(row => row.columnId && row.value.trim())
      .map((row): GetListRecordsServiceFilter => ({ column_id: Number(row.columnId), value: row.value })),
    [filterRows],
  );

  const activeFiltersKey = useMemo(() => JSON.stringify(activeFilters), [activeFilters]);

  const lastActiveFiltersKeyRef = useRef(activeFiltersKey);

  const {
    data: recordsData,
    isFetching: recordsIsFetching,
    refetch: recordsRefetch,
  } = useQuery({
    queryKey: GET_LIST_RECORDS_KEY,
    queryFn: ({ signal }) => getListRecordsService({
      signal,
      query: {
        filters: activeFilters,
        page,
        per_page: perPage,
      },
    }),
    enabled: columns.length > 0,
  });

  function updateQueryParams(nextPage: number, nextPerPage: number, nextFilterRows: ListFilterRow[]) {
    const params = new URLSearchParams();

    params.set('page', String(nextPage));
    params.set('per_page', String(nextPerPage));

    const activeFilters = nextFilterRows
      .filter(row => row.columnId)
      .map(row => ({ column_id: row.columnId, value: row.value }));

    if (activeFilters.length > 0) params.set('filters', JSON.stringify(activeFilters));

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  useDebouncedEffect(() => {
    const filtersChanged = activeFiltersKey !== lastActiveFiltersKeyRef.current;

    lastActiveFiltersKeyRef.current = activeFiltersKey;

    if (filtersChanged) {
      setPage(1);
      recordsRefetch();
    }

    updateQueryParams(filtersChanged ? 1 : page, perPage, filterRows);
  }, [filterRows], 500);

  const records = useMemo(() => recordsData?.data.items ?? [], [recordsData]);
  const recordsMeta = useMemo<Partial<PaginatedMeta>>(() => recordsData?.data.meta ?? {}, [recordsData]);

  const createListRecordLogicData = useCreateListRecordLogicData({
    fields,
    objects,
    onSuccess: () => {
      recordsRefetch();
      setCreateOpen(false);
    },
  });

  const updateListRecordLogicData = useUpdateListRecordLogicData({
    recordId: editingRecord?.id ?? 0,
    fields,
    objects,
    onSuccess: () => {
      recordsRefetch();
      setUpdateOpen(false);
    },
  });

  const deleteListRecordLogicData = useDeleteListRecordLogicData({
    recordId: editingRecord?.id ?? 0,
    onSuccess: () => {
      recordsRefetch();
      setDeleteOpen(false);
    },
  });

  function openCreate() {
    createListRecordLogicData.createListRecordReset();
    setCreateOpen(true);
  }

  function openUpdate(record: IListRecord) {
    setEditingRecord(record);
    updateListRecordLogicData.updateListRecordValidatedFormState.setState(record.values as any);
    setUpdateOpen(true);
  }

  function openDelete(record: IListRecord) {
    setEditingRecord(record);
    setDeleteOpen(true);
  }

  function addFilterRow() {
    setFilterRows(prev => [...prev, createEmptyFilterRow()]);
  }

  function removeFilterRow(id: string) {
    setFilterRows(prev => prev.filter(row => row.id !== id));
  }

  function setFilterColumn(id: string, columnId: string) {
    setFilterRows(prev => prev.map(row => row.id === id ? { ...row, columnId, value: '' } : row));
  }

  function setFilterValue(id: string, value: string) {
    setFilterRows(prev => prev.map(row => row.id === id ? { ...row, value } : row));
  }

  function handleSetPerPage(newPerPage: number) {
    setPerPage(newPerPage);
    setPage(1);
    recordsRefetch();
    updateQueryParams(1, newPerPage, filterRows);
  }

  const tableColumns = useMemo(
    () => Object.fromEntries(columns.map(c => [`col_${c.id}`, c.label])),
    [columns],
  );

  const renderCells = useMemo(
    () => Object.fromEntries(columns.map(c => [
      `col_${c.id}`,
      ({ item }: { item: IListRecord }) => formatColumnValue(item.values, c, fieldsByKey, internalListsById),
    ])),
    [columns, fieldsByKey, internalListsById],
  );

  return (
    <main className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('list.page.title')}
          </h1>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('list.page.subtitle')}
          </span>
        </div>

        <FormButton
          color="primary"
          leftIcon="lucide:plus"
          onClick={openCreate}
          disabled={fields.length === 0}
        >
          {t('list.actions.new')}
        </FormButton>
      </div>

      <UtilsCard className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <UtilsFor
            each={filterRows}
            eachKey={({ item }) => item.id}
          >
            {({ item: row }) => {
              const column = columnsById[row.columnId ? Number(row.columnId) : -1];
              const internalList = getColumnInternalList(column, fieldsByKey, objectsById, internalListsById);

              return (
                <div className="flex items-center gap-4">
                  <FormSelect
                    placeholder={t('list.filters.column')}
                    data={columns}
                    valueField="id"
                    labelField="label"
                    value={row.columnId}
                    onChange={v => setFilterColumn(row.id, v ?? '')}
                    clearable
                    className="w-56"
                  />

                  <UtilsIf
                    cases={[
                      {
                        condition: !!internalList,
                        content: () => (
                          <FormSelect
                            placeholder={t('list.filters.search')}
                            data={internalList?.items ?? []}
                            valueField="label"
                            labelField="label"
                            value={row.value}
                            onChange={v => setFilterValue(row.id, v ?? '')}
                            disabled={!row.columnId}
                            clearable
                            className="max-w-xs w-full"
                          />
                        ),
                      },
                      {
                        content: () => (
                          <FormTextInput
                            placeholder={t('list.filters.search')}
                            value={row.value}
                            onChange={v => setFilterValue(row.id, v)}
                            leftSection={<Icon icon="lucide:search" className="text-gray-500" />}
                            disabled={!row.columnId}
                            className="max-w-xs w-full"
                          />
                        ),
                      },
                    ]}
                  />

                  <UtilsIf condition={!!row.value.trim()}>
                    {() => (
                      <FormButton
                        variant="subtle"
                        color="red"
                        icon="lucide:x"
                        tooltip={t('list.filters.remove')}
                        onClick={() => removeFilterRow(row.id)}
                      />
                    )}
                  </UtilsIf>
                </div>
              );
            }}
          </UtilsFor>

          <div>
            <FormButton
              variant="default"
              size="xs"
              leftIcon="lucide:plus"
              onClick={addFilterRow}
            >
              {t('list.filters.add')}
            </FormButton>
          </div>
        </div>

        <UtilsTable
          rows={records}
          rowKey={({ item }) => item.id}
          showRowNumber
          paginationPosition="top"
          loading={recordsIsFetching}
          lastPage={recordsMeta.last_page ?? 1}
          page={page}
          perPage={perPage}
          perPageOptions={PER_PAGE_OPTIONS}
          setPerPage={handleSetPerPage}
          setPage={(newPage) => {
            setPage(newPage);
            recordsRefetch();
            updateQueryParams(newPage, perPage, filterRows);
          }}
          emptyText={t('list.table.empty')}
          columns={tableColumns}
          renderCells={renderCells as any}
          actions={[
            {
              icon: 'lucide:pencil',
              label: t('common.actions.edit'),
              onClick: ({ item }) => openUpdate(item),
            },
            {
              icon: 'lucide:trash-2',
              label: t('common.actions.delete'),
              color: 'red',
              onClick: ({ item }) => openDelete(item),
            },
          ]}
        />
      </UtilsCard>

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('list.modals.create')}
        size="xl"
        centered
      >
        <CreateListRecordLogicComponent
          logicData={createListRecordLogicData}
          fields={fields}
          internalLists={internalLists}
          objects={objects}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        opened={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title={t('list.modals.update')}
        size="xl"
        centered
      >
        <UpdateListRecordLogicComponent
          logicData={updateListRecordLogicData}
          fields={fields}
          internalLists={internalLists}
          objects={objects}
          onCancel={() => setUpdateOpen(false)}
        />
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('list.modals.delete')}
        size="md"
        centered
      >
        <DeleteListRecordLogicComponent
          logicData={deleteListRecordLogicData}
          onCancel={() => setDeleteOpen(false)}
        />
      </Modal>
    </main>
  );
}
