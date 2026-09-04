'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { deleteListFieldService } from '../services/deleteListField';

export function useDeleteListFieldLogicData({ fieldId, onSuccess }: { fieldId: number; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const deleteListFieldMutation = useMutation({
    mutationFn: () => deleteListFieldService({ fieldId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.fields.notifications.deleteError'),
        color: 'red',
      });
    },
  });

  return { deleteListFieldMutation };
}

export function DeleteListFieldLogicComponent({ logicData, fieldLabel, onCancel }: { logicData: ReturnType<typeof useDeleteListFieldLogicData>; fieldLabel: string; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    deleteListFieldMutation: { mutate: deleteListField, isPending: deleteListFieldIsPending },
  } = logicData;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-600 text-sm">
        {t('admin.settings.fields.delete.confirm', { label: fieldLabel })}
      </p>

      <div className="flex justify-end gap-2">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={deleteListFieldIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          color="red"
          loading={deleteListFieldIsPending}
          onClick={() => deleteListField()}
        >
          {t('common.actions.delete')}
        </FormButton>
      </div>
    </div>
  );
}
