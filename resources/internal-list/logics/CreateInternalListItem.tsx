'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormSelect } from '@/src/components/form/Select';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { createInternalListItemService } from '../services/createInternalListItem';
import { EInternalListItemColor } from '../enums/InternalListItemColor';

export function CreateInternalListItemInline({ listId, showColor, onCreated }: { listId: number; showColor: boolean; onCreated: () => void }) {
  const { t, i18n } = useTranslation();
  const [label, setLabel] = useState('');
  const [color, setColor] = useState<`${EInternalListItemColor}` | null>(null);

  const createMutation = useMutation({
    mutationFn: () => createInternalListItemService({ listId, body: { label, color: showColor ? color : null } }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      setLabel('');
      setColor(null);
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

      {showColor ? (
        <FormSelect
          label={t('admin.settings.lists.item.color.label')}
          placeholder={t('admin.settings.lists.item.color.placeholder')}
          data={Object.values(EInternalListItemColor).map(itemColor => ({
            value: itemColor,
            label: t(`admin.settings.lists.item.color.options.${itemColor}`),
          }))}
          value={color}
          onChange={value => setColor(value as `${EInternalListItemColor}` | null)}
          clearable
          className="w-44"
        />
      ) : null}

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
