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
import { FormSwitch } from '@/src/components/form/Switch';
import { useValidatedFormState } from '@/src/utils/state';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { createListFieldService } from '../services/createListField';
import { EListFieldType } from '../enums/ListFieldType';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';
import type { IObject } from '@/src/resources/object/models/Object';

const TYPE_OPTIONS = Object.values(EListFieldType);

export function useCreateListFieldLogicData({ onSuccess }: { onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const createListFieldSchema = useMemo(() => yup.object({
    key: yup.string().default('').required(t('admin.settings.fields.validation.keyRequired')).matches(/^[a-z0-9_]+$/, t('admin.settings.fields.validation.keyFormat')),
    label: yup.string().default('').required(t('admin.settings.fields.validation.labelRequired')),
    type: yup.string().default(EListFieldType.TEXT).required() as any,
    required: yup.boolean().default(false),
    internal_list_id: yup.number().default(null).nullable(),
    object_id: yup.number().default(null).nullable(),
  }), [t]);

  const createListFieldValidatedFormState = useValidatedFormState<Record<string, any>>(createListFieldSchema as any);

  const createListFieldMutation = useMutation({
    mutationFn: () => {
      const state = createListFieldValidatedFormState.state as any;

      return createListFieldService({
        body: {
          key: state.key,
          label: state.label,
          type: state.type,
          required: state.required,
          internal_list_id: state.type === EListFieldType.SELECT ? state.internal_list_id : null,
          object_id: state.type === EListFieldType.OBJECT ? state.object_id : null,
        },
      });
    },
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.fields.notifications.createError'),
        color: 'red',
      });
    },
  });

  function createListFieldReset() {
    createListFieldValidatedFormState.setState(createListFieldSchema.getDefault() as any);
    createListFieldValidatedFormState.setErrors({});
  }

  return { createListFieldValidatedFormState, createListFieldMutation, createListFieldReset };
}

export function CreateListFieldLogicComponent({
  logicData,
  internalLists,
  objects,
  onCancel,
}: {
  logicData: ReturnType<typeof useCreateListFieldLogicData>;
  internalLists: IInternalList[];
  objects: IObject[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const {
    createListFieldValidatedFormState: { state, field: listFieldField, validate: validateListField },
    createListFieldMutation: { mutate: createListField, isPending: createListFieldIsPending },
  } = logicData;

  async function submit() {
    if (!await validateListField()) return;
    createListField();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <div className="form-grid">
        <FormTextInput
          label={t('admin.settings.fields.label.label')}
          placeholder={t('admin.settings.fields.label.placeholder')}
          {...listFieldField('label')}
          required
          className="col-span-12"
        />

        <FormTextInput
          label={t('admin.settings.fields.key.label')}
          placeholder={t('admin.settings.fields.key.placeholder')}
          description={t('admin.settings.fields.key.description')}
          {...listFieldField('key')}
          required
          className="col-span-12"
        />

        <FormSelect
          label={t('admin.settings.fields.type.label')}
          data={TYPE_OPTIONS.map(value => ({ value, label: t(`admin.settings.fields.types.${value}`) }))}
          {...listFieldField('type')}
          clearable={false}
          required
          className="col-span-12"
        />

        <FormSwitch
          label={t('admin.settings.fields.required.label')}
          {...listFieldField('required')}
          className="col-span-12"
        />

        {(state as any).type === EListFieldType.SELECT ? (
          <FormSelect
            label={t('admin.settings.fields.internalList.label')}
            placeholder={t('admin.settings.fields.internalList.placeholder')}
            data={internalLists}
            valueField="id"
            labelField="name"
            {...listFieldField('internal_list_id')}
            required
            className="col-span-12"
          />
        ) : null}

        {(state as any).type === EListFieldType.OBJECT ? (
          <FormSelect
            label={t('admin.settings.fields.object.label')}
            placeholder={t('admin.settings.fields.object.placeholder')}
            data={objects}
            valueField="id"
            labelField="name"
            {...listFieldField('object_id')}
            required
            className="col-span-12"
          />
        ) : null}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={createListFieldIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          type="submit"
          color="primary"
          loading={createListFieldIsPending}
        >
          {t('common.actions.save')}
        </FormButton>
      </div>
    </Form>
  );
}
