'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { deleteObjectService } from '../services/deleteObject';

export function useDeleteObjectLogicData({ objectId, onSuccess }: { objectId: number; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const deleteObjectMutation = useMutation({
    mutationFn: () => deleteObjectService({ objectId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.objects.notifications.deleteError'),
        color: 'red',
      });
    },
  });

  return { deleteObjectMutation };
}

export function DeleteObjectLogicComponent({ logicData, objectName, onCancel }: { logicData: ReturnType<typeof useDeleteObjectLogicData>; objectName: string; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    deleteObjectMutation: { mutate: deleteObject, isPending: deleteObjectIsPending },
  } = logicData;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600 text-sm">
        {t('admin.settings.objects.delete.confirm', { name: objectName })}
      </p>

      <div className="flex justify-end gap-2">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={deleteObjectIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          color="red"
          loading={deleteObjectIsPending}
          onClick={() => deleteObject()}
        >
          {t('common.actions.delete')}
        </FormButton>
      </div>
    </div>
  );
}
