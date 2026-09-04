'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { UtilsCard } from '@/src/components/utils/Card';
import { UtilsTable } from '@/src/components/utils/Table';
import { FormButton } from '@/src/components/form/Button';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormSelect } from '@/src/components/form/Select';
import { useImmediateState, useRecordState } from '@/src/utils/state';
import { useDebouncedEffect } from '@/src/utils/hooks';
import { getListConfigService, GET_LIST_CONFIG_KEY } from '@/src/resources/list-config/services/getListConfig';
import { getListRecordsService, GET_LIST_RECORDS_KEY } from '@/src/resources/list-record/services/getListRecords';
import { useCreateListRecordLogicData, CreateListRecordLogicComponent } from '@/src/resources/list-record/logics/CreateListRecord';
import { useUpdateListRecordLogicData, UpdateListRecordLogicComponent } from '@/src/resources/list-record/logics/UpdateListRecord';
import { useDeleteListRecordLogicData, DeleteListRecordLogicComponent } from '@/src/resources/list-record/logics/DeleteListRecord';
import { formatColumnValue } from '@/src/components/list/formatColumnValue';
import type { IListRecord } from '@/src/resources/list-record/models/ListRecord';
import type { PaginatedMeta } from '@/src/shared/types/api';

const PER_PAGE = 15;

export default function ListaPage() {
  const { t } = useTranslation();

  const [page, setPage] = useImmediateState(1);
  const { state: filters, field: filterField, setValue: setFilterValue } = useRecordState({ columnId: '', value: '' });
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

  const {
    data: recordsData,
    isFetching: recordsIsFetching,
    refetch: recordsRefetch,
  } = useQuery({
    queryKey: GET_LIST_RECORDS_KEY,
    queryFn: ({ signal }) => getListRecordsService({
      signal,
      query: {
        column_id: filters.columnId ? Number(filters.columnId) : undefined,
        value: filters.value || undefined,
        page,
        per_page: PER_PAGE,
      },
    }),
    enabled: columns.length > 0,
  });

  useDebouncedEffect(() => {
    setPage(1);
    recordsRefetch();
  }, [filters], 500);

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
        <div className="flex items-center gap-4">
          <FormSelect
            placeholder={t('list.filters.column')}
            data={columns}
            valueField="id"
            labelField="label"
            {...filterField('columnId')}
            onChange={(v) => {
              setFilterValue('columnId', v ?? '');
            }}
            clearable
            className="w-56"
          />

          <FormTextInput
            placeholder={t('list.filters.search')}
            {...filterField('value')}
            leftSection={<Icon icon="lucide:search" className="text-gray-500" />}
            disabled={!filters.columnId}
            className="max-w-xs w-full"
          />
        </div>

        <UtilsTable
          rows={records}
          rowKey={({ item }) => item.id}
          showRowNumber
          loading={recordsIsFetching}
          lastPage={recordsMeta.last_page ?? 1}
          page={page}
          perPage={PER_PAGE}
          setPage={(newPage) => {
            setPage(newPage);
            recordsRefetch();
          }}
          emptyText={t('list.table.empty')}
          columns={tableColumns}
          renderCells={renderCells as any}
          actions={[
            {
              variant: 'outline',
              icon: 'lucide:pencil',
              label: t('common.actions.edit'),
              onClick: ({ item }) => openUpdate(item),
            },
            {
              variant: 'outline',
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
