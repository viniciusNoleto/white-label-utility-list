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
import { createListColumnService } from '../services/createListColumn';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';
import type { IListField } from '@/src/resources/list-field/models/ListField';
import type { IObject } from '@/src/resources/object/models/Object';

export function useCreateListColumnLogicData({ onSuccess }: { onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const createListColumnSchema = useMemo(() => yup.object({
    field_key: yup.string().default('').required(t('admin.settings.columns.validation.fieldRequired')),
    sub_path: yup.string().default('').nullable(),
    label: yup.string().default('').required(t('admin.settings.columns.validation.labelRequired')),
  }), [t]);

  const createListColumnValidatedFormState = useValidatedFormState(createListColumnSchema);

  const createListColumnMutation = useMutation({
    mutationFn: () => {
      const state = createListColumnValidatedFormState.state;
      return createListColumnService({
        body: {
          field_key: state.field_key,
          sub_path: state.sub_path || null,
          label: state.label,
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
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.columns.notifications.createError'),
        color: 'red',
      });
    },
  });

  function createListColumnReset() {
    createListColumnValidatedFormState.setState(createListColumnSchema.getDefault());
    createListColumnValidatedFormState.setErrors({});
  }

  return { createListColumnValidatedFormState, createListColumnMutation, createListColumnReset };
}

export function CreateListColumnLogicComponent({
  logicData,
  fields,
  objects,
  onCancel,
}: {
  logicData: ReturnType<typeof useCreateListColumnLogicData>;
  fields: IListField[];
  objects: IObject[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const {
    createListColumnValidatedFormState: { state, field: columnField, validate: validateColumn, setValue: setColumnValue },
    createListColumnMutation: { mutate: createListColumn, isPending: createListColumnIsPending },
  } = logicData;

  const selectedField = fields.find(f => f.key === state.field_key);
  const selectedObject = selectedField?.type === EListFieldType.OBJECT ? objects.find(o => o.id === selectedField.object_id) : undefined;

  async function submit() {
    if (!await validateColumn()) return;
    createListColumn();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <div className="form-grid">
        <FormSelect
          label={t('admin.settings.columns.field.label')}
          placeholder={t('admin.settings.columns.field.placeholder')}
          data={fields}
          valueField="key"
          labelField="label"
          {...columnField('field_key')}
          onChange={(value) => {
            setColumnValue('field_key', value ?? '');
            setColumnValue('sub_path', '');
          }}
          clearable={false}
          required
          className="col-span-12"
        />

        {selectedObject ? (
          <FormSelect
            label={t('admin.settings.columns.subPath.label')}
            placeholder={t('admin.settings.columns.subPath.placeholder')}
            data={[...selectedObject.fields]
              .sort((a, b) => a.position - b.position)
              .map(objectField => ({ value: objectField.key, label: objectField.label }))}
            {...columnField('sub_path')}
            clearable={false}
            required
            className="col-span-12"
          />
        ) : null}

        <FormTextInput
          label={t('admin.settings.columns.label.label')}
          placeholder={t('admin.settings.columns.label.placeholder')}
          {...columnField('label')}
          required
          className="col-span-12"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={createListColumnIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          type="submit"
          color="primary"
          loading={createListColumnIsPending}
        >
          {t('common.actions.save')}
        </FormButton>
      </div>
    </Form>
  );
}
