'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { deleteInternalListService } from '../services/deleteInternalList';

export function useDeleteInternalListLogicData({ listId, onSuccess }: { listId: number; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const deleteInternalListMutation = useMutation({
    mutationFn: () => deleteInternalListService({ listId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.lists.notifications.deleteError'),
        color: 'red',
      });
    },
  });

  return { deleteInternalListMutation };
}

export function DeleteInternalListLogicComponent({ logicData, listName, onCancel }: { logicData: ReturnType<typeof useDeleteInternalListLogicData>; listName: string; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    deleteInternalListMutation: { mutate: deleteInternalList, isPending: deleteInternalListIsPending },
  } = logicData;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600 text-sm">
        {t('admin.settings.lists.delete.confirm', { name: listName })}
      </p>

      <div className="flex justify-end gap-2">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={deleteInternalListIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          color="red"
          loading={deleteInternalListIsPending}
          onClick={() => deleteInternalList()}
        >
          {t('common.actions.delete')}
        </FormButton>
      </div>
    </div>
  );
}
