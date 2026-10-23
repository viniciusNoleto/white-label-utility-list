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
import { createInternalListService } from '../services/createInternalList';
import { EInternalListDisplayStyle } from '../enums/InternalListDisplayStyle';
import type { IInternalList } from '../models/InternalList';

export function useCreateInternalListLogicData({ onSuccess }: { onSuccess: (list: IInternalList) => void }) {
  const { t, i18n } = useTranslation();

  const createInternalListSchema = useMemo(() => yup.object({
    key: yup.string().default('').required(t('admin.settings.lists.validation.keyRequired')).matches(/^[a-z0-9_]+$/, t('admin.settings.lists.validation.keyFormat')),
    name: yup.string().default('').required(t('admin.settings.lists.validation.nameRequired')),
    display_style: yup.string().default(EInternalListDisplayStyle.TEXT).required() as any,
  }), [t]);

  const createInternalListValidatedFormState = useValidatedFormState(createInternalListSchema);

  const createInternalListMutation = useMutation({
    mutationFn: () => createInternalListService({ body: createInternalListValidatedFormState.state }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess(res.data);
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.lists.notifications.createError'),
        color: 'red',
      });
    },
  });

  function createInternalListReset() {
    createInternalListValidatedFormState.setState(createInternalListSchema.getDefault());
    createInternalListValidatedFormState.setErrors({});
  }

  return { createInternalListValidatedFormState, createInternalListMutation, createInternalListReset };
}

export function CreateInternalListLogicComponent({ logicData, onCancel }: { logicData: ReturnType<typeof useCreateInternalListLogicData>; onCancel: () => void }) {
  const { t } = useTranslation();

  const {
    createInternalListValidatedFormState: { field: internalListField, validate: validateInternalList },
    createInternalListMutation: { mutate: createInternalList, isPending: createInternalListIsPending },
  } = logicData;

  async function submit() {
    if (!await validateInternalList()) return;
    createInternalList();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <div className="form-grid">
        <FormTextInput
          label={t('admin.settings.lists.name.label')}
          placeholder={t('admin.settings.lists.name.placeholder')}
          {...internalListField('name')}
          required
          className="col-span-12"
        />

        <FormTextInput
          label={t('admin.settings.lists.key.label')}
          placeholder={t('admin.settings.lists.key.placeholder')}
          description={t('admin.settings.lists.key.description')}
          {...internalListField('key')}
          required
          className="col-span-12"
        />

        <FormSelect
          label={t('admin.settings.lists.displayStyle.label')}
          description={t('admin.settings.lists.displayStyle.description')}
          data={[
            { value: EInternalListDisplayStyle.TEXT, label: t('admin.settings.lists.displayStyle.options.text') },
            { value: EInternalListDisplayStyle.BADGE, label: t('admin.settings.lists.displayStyle.options.badge') },
          ]}
          {...internalListField('display_style')}
          required
          className="col-span-12"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={createInternalListIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          type="submit"
          color="primary"
          loading={createInternalListIsPending}
        >
          {t('common.actions.save')}
        </FormButton>
      </div>
    </Form>
  );
}
