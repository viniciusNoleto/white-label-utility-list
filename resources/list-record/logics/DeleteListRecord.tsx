'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { deleteListRecordService } from '../services/deleteListRecord';

export function useDeleteListRecordLogicData({ recordId, onSuccess }: { recordId: number; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const deleteListRecordMutation = useMutation({
    mutationFn: () => deleteListRecordService({ recordId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('list.notifications.deleteError'),
        color: 'red',
      });
    },
  });

  return { deleteListRecordMutation };
}

export function DeleteListRecordLogicComponent({ logicData, onCancel }: { logicData: ReturnType<typeof useDeleteListRecordLogicData>; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    deleteListRecordMutation: { mutate: deleteListRecord, isPending: deleteListRecordIsPending },
  } = logicData;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600 text-sm">
        {t('list.delete.confirm')}
      </p>

      <div className="flex justify-end gap-2">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={deleteListRecordIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          color="red"
          loading={deleteListRecordIsPending}
          onClick={() => deleteListRecord()}
        >
          {t('common.actions.delete')}
        </FormButton>
      </div>
    </div>
  );
}
