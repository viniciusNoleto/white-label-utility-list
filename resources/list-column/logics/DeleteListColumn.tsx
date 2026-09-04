'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { deleteListColumnService } from '../services/deleteListColumn';

export function useDeleteListColumnLogicData({ columnId, onSuccess }: { columnId: number; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const deleteListColumnMutation = useMutation({
    mutationFn: () => deleteListColumnService({ columnId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.columns.notifications.deleteError'),
        color: 'red',
      });
    },
  });

  return { deleteListColumnMutation };
}

export function DeleteListColumnLogicComponent({ logicData, columnLabel, onCancel }: { logicData: ReturnType<typeof useDeleteListColumnLogicData>; columnLabel: string; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    deleteListColumnMutation: { mutate: deleteListColumn, isPending: deleteListColumnIsPending },
  } = logicData;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600 text-sm">
        {t('admin.settings.columns.delete.confirm', { label: columnLabel })}
      </p>

      <div className="flex justify-end gap-2">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={deleteListColumnIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          color="red"
          loading={deleteListColumnIsPending}
          onClick={() => deleteListColumn()}
        >
          {t('common.actions.delete')}
        </FormButton>
      </div>
    </div>
  );
}
