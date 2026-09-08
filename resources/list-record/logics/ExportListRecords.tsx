'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { FormButton } from '@/src/components/form/Button';
import { FormSwitch } from '@/src/components/form/Switch';
import { UtilsFor } from '@/src/components/utils/For';
import { UtilsIf } from '@/src/components/utils/If';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { formatFileSize } from '@/src/utils/format';
import { getListRecordsExportEstimateService, GET_LIST_RECORDS_EXPORT_ESTIMATE_KEY, type IListRecordsExportEstimate } from '../services/getListRecordsExportEstimate';
import { exportListRecordsService } from '../services/exportListRecords';
import type { GetListRecordsServiceFilter } from '../services/getListRecords';

const EXPORT_NOTIFICATION_ID = 'export-list-records';

export function useExportListRecordsLogicData({ filters }: { filters: GetListRecordsServiceFilter[] }) {
  const { t, i18n } = useTranslation();

  const hasFilters = filters.length > 0;

  const [applyFilters, setApplyFilters] = useState(hasFilters);
  const [exportEstimate, setExportEstimate] = useState<IListRecordsExportEstimate | null>(null);

  const exportEstimateQuery = useQuery({
    queryKey: GET_LIST_RECORDS_EXPORT_ESTIMATE_KEY,
    queryFn: ({ signal }) => getListRecordsExportEstimateService({ signal, query: { filters, apply_filters: applyFilters } }),
    enabled: false,
  });

  const exportListRecordsMutation = useMutation({
    mutationFn: () => exportListRecordsService({ query: { filters, apply_filters: applyFilters } }),
    onMutate: () => {
      notifications.show({
        id: EXPORT_NOTIFICATION_ID,
        loading: true,
        title: t('list.export.notifications.title'),
        message: t('list.export.notifications.preparing'),
        autoClose: false,
        withCloseButton: false,
      });
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      notifications.update({
        id: EXPORT_NOTIFICATION_ID,
        loading: false,
        color: 'green',
        icon: <Icon icon="lucide:check" />,
        title: t('list.export.notifications.title'),
        message: t('list.export.notifications.success', { filename }),
        autoClose: false,
        withCloseButton: true,
      });
    },
    onError: (err: any) => {
      notifications.update({
        id: EXPORT_NOTIFICATION_ID,
        loading: false,
        color: 'red',
        icon: <Icon icon="lucide:x" />,
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('list.export.notifications.error'),
        autoClose: false,
        withCloseButton: true,
      });
    },
  });

  function handleSetApplyFilters(nextApplyFilters: boolean) {
    setApplyFilters(nextApplyFilters);
    setExportEstimate(null);
  }

  function exportListRecordsReset() {
    setApplyFilters(hasFilters);
    setExportEstimate(null);
  }

  async function calculateExportEstimate() {
    const result = await exportEstimateQuery.refetch({ throwOnError: true });

    if (result.data) setExportEstimate(result.data.data);
  }

  return {
    hasFilters,
    applyFilters,
    setApplyFilters: handleSetApplyFilters,
    exportEstimate,
    exportEstimateIsFetching: exportEstimateQuery.isFetching,
    calculateExportEstimate,
    exportListRecordsMutation,
    exportListRecordsReset,
  };
}

export function ExportListRecordsLogicComponent({ logicData, filterDescriptions, onCancel }: { logicData: ReturnType<typeof useExportListRecordsLogicData>; filterDescriptions: { label: string; value: string }[]; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    hasFilters,
    applyFilters,
    setApplyFilters,
    exportEstimate,
    exportEstimateIsFetching,
    calculateExportEstimate,
    exportListRecordsMutation: { mutate: exportListRecords, isPending: exportListRecordsIsPending },
  } = logicData;

  return (
    <div className="flex flex-col gap-4">
      <UtilsIf condition={hasFilters}>
        {() => (
          <div className="flex flex-col gap-5 p-3 rounded border border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-600">
              {applyFilters ? t('list.export.filterApplied') : t('list.export.filterIgnored')}
            </p>

            <div className="flex flex-col gap-1">
              <UtilsFor
                each={filterDescriptions}
                eachKey={({ index }) => index}
              >
                {({ item }) => (
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">
                      {item.label}
                    </span>

                    {': '}

                    {item.value}
                  </span>
                )}
              </UtilsFor>
            </div>

            <FormSwitch
              label={t('list.export.applyFilter')}
              value={applyFilters}
              onChange={setApplyFilters}
              disabled={exportListRecordsIsPending}
            />
          </div>
        )}
      </UtilsIf>

      <UtilsIf condition={!hasFilters}>
        {() => (
          <p className="text-sm text-gray-600">
            {t('list.export.noFilter')}
          </p>
        )}
      </UtilsIf>

      <UtilsIf condition={!!exportEstimate}>
        {() => (
          <p className="text-sm text-gray-600">
            {t('list.export.estimatedSize', { rows: exportEstimate!.row_count, size: formatFileSize(exportEstimate!.estimated_bytes) })}
          </p>
        )}
      </UtilsIf>

      <div className="flex justify-end gap-2">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={exportListRecordsIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <UtilsIf
          cases={[
            {
              condition: !exportEstimate,
              content: () => (
                <FormButton
                  color="primary"
                  loading={exportEstimateIsFetching}
                  onClick={() => calculateExportEstimate()}
                >
                  {t('list.export.actions.calculate')}
                </FormButton>
              ),
            },
            {
              content: () => (
                <FormButton
                  color="primary"
                  loading={exportListRecordsIsPending}
                  onClick={() => exportListRecords()}
                >
                  {t('list.export.actions.confirm')}
                </FormButton>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
