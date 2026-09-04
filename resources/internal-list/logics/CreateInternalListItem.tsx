'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { createInternalListItemService } from '../services/createInternalListItem';

export function CreateInternalListItemInline({ listId, onCreated }: { listId: number; onCreated: () => void }) {
  const { t, i18n } = useTranslation();
  const [label, setLabel] = useState('');

  const createMutation = useMutation({
    mutationFn: () => createInternalListItemService({ listId, body: { label } }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      setLabel('');
      onCreated();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.lists.notifications.createItemError'),
        color: 'red',
      });
    },
  });

  return (
    <div className="flex items-end gap-2">
      <FormTextInput
        label={t('admin.settings.lists.item.label')}
        placeholder={t('admin.settings.lists.item.placeholder')}
        value={label}
        onChange={setLabel}
        className="flex-1"
      />

      <FormButton
        color="primary"
        leftIcon="lucide:plus"
        loading={createMutation.isPending}
        disabled={!label.trim()}
        onClick={() => createMutation.mutate()}
      >
        {t('common.actions.add')}
      </FormButton>
    </div>
  );
}
