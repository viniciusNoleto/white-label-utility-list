'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { deleteInternalListItemService } from '../services/deleteInternalListItem';

export function DeleteInternalListItemButton({ listId, itemId, onDeleted }: { listId: number; itemId: number; onDeleted: () => void }) {
  const { t, i18n } = useTranslation();

  const deleteMutation = useMutation({
    mutationFn: () => deleteInternalListItemService({ listId, itemId }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onDeleted();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.lists.notifications.deleteItemError'),
        color: 'red',
      });
    },
  });

  return (
    <FormButton
      icon="lucide:trash-2"
      tooltip={t('common.actions.delete')}
      variant="outline"
      color="red"
      loading={deleteMutation.isPending}
      onClick={() => deleteMutation.mutate()}
    />
  );
}
