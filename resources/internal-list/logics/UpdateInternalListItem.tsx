'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/src/components/form/Form';
import { FormButton } from '@/src/components/form/Button';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormSelect } from '@/src/components/form/Select';
import { useValidatedFormState } from '@/src/utils/state';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { updateInternalListItemService } from '../services/updateInternalListItem';
import { EInternalListItemColor } from '../enums/InternalListItemColor';
import type { IInternalListItem } from '../models/InternalList';

export function useUpdateInternalListItemLogicData({ listId, editingInternalListItemId, onSuccess }: { listId: number; editingInternalListItemId: number; onSuccess: (item: IInternalListItem) => void }) {
  const { t, i18n } = useTranslation();

  const updateInternalListItemSchema = useMemo(() => yup.object({
    label: yup.string().default('').required(t('admin.settings.lists.validation.itemLabelRequired')),
    color: yup.string().default(null).nullable().optional() as any,
  }), [t]);

  const updateInternalListItemValidatedFormState = useValidatedFormState(updateInternalListItemSchema);

  const updateInternalListItemMutation = useMutation({
    mutationFn: () => updateInternalListItemService({ listId, itemId: editingInternalListItemId, body: updateInternalListItemValidatedFormState.state }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess(res.data);
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.lists.notifications.updateItemError'),
        color: 'red',
      });
    },
  });

  return { updateInternalListItemValidatedFormState, updateInternalListItemMutation };
}

export function UpdateInternalListItemLogicComponent({ logicData, showColor, onCancel }: { logicData: ReturnType<typeof useUpdateInternalListItemLogicData>; showColor: boolean; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    updateInternalListItemValidatedFormState: { field: internalListItemField, validate: validateInternalListItem },
    updateInternalListItemMutation: { mutate: updateInternalListItem, isPending: updateInternalListItemIsPending },
  } = logicData;

  async function submit() {
    if (!await validateInternalListItem()) return;
    updateInternalListItem();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <FormTextInput
        label={t('admin.settings.lists.item.label')}
        placeholder={t('admin.settings.lists.item.placeholder')}
        {...internalListItemField('label')}
        required
      />

      {showColor ? (
        <FormSelect
          label={t('admin.settings.lists.item.color.label')}
          placeholder={t('admin.settings.lists.item.color.placeholder')}
          data={Object.values(EInternalListItemColor).map(color => ({
            value: color,
            label: t(`admin.settings.lists.item.color.options.${color}`),
          }))}
          {...internalListItemField('color')}
          clearable
        />
      ) : null}

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={updateInternalListItemIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          type="submit"
          color="primary"
          loading={updateInternalListItemIsPending}
        >
          {t('common.actions.save')}
        </FormButton>
      </div>
    </Form>
  );
}
