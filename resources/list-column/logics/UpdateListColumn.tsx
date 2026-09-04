'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/src/components/form/Form';
import { FormButton } from '@/src/components/form/Button';
import { FormTextInput } from '@/src/components/form/TextInput';
import { useValidatedFormState } from '@/src/utils/state';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { updateListColumnService } from '../services/updateListColumn';

export function useUpdateListColumnLogicData({ columnId, onSuccess }: { columnId: number; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const updateListColumnSchema = useMemo(() => yup.object({
    label: yup.string().default('').required(t('admin.settings.columns.validation.labelRequired')),
  }), [t]);

  const updateListColumnValidatedFormState = useValidatedFormState(updateListColumnSchema);

  const updateListColumnMutation = useMutation({
    mutationFn: () => updateListColumnService({ columnId, body: { label: updateListColumnValidatedFormState.state.label } }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.columns.notifications.updateError'),
        color: 'red',
      });
    },
  });

  return { updateListColumnValidatedFormState, updateListColumnMutation };
}

export function UpdateListColumnLogicComponent({ logicData, onCancel }: { logicData: ReturnType<typeof useUpdateListColumnLogicData>; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    updateListColumnValidatedFormState: { field: columnField, validate: validateColumn },
    updateListColumnMutation: { mutate: updateListColumn, isPending: updateListColumnIsPending },
  } = logicData;

  async function submit() {
    if (!await validateColumn()) return;
    updateListColumn();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <FormTextInput
        label={t('admin.settings.columns.label.label')}
        placeholder={t('admin.settings.columns.label.placeholder')}
        {...columnField('label')}
        required
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={updateListColumnIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          type="submit"
          color="primary"
          loading={updateListColumnIsPending}
        >
          {t('common.actions.save')}
        </FormButton>
      </div>
    </Form>
  );
}
