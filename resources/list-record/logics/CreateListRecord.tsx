'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/src/components/form/Form';
import { FormButton } from '@/src/components/form/Button';
import { useValidatedFormState } from '@/src/utils/state';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { DynamicRecordFields } from '@/src/app/(protected)/list/_components/DynamicRecordFields';
import { buildListRecordSchema, normalizeListRecordValues } from '@/src/app/(protected)/list/_components/dynamicSchema';
import { createListRecordService } from '../services/createListRecord';
import type { IListField } from '@/src/resources/list-field/models/ListField';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';
import type { IObject } from '@/src/resources/object/models/Object';

export function useCreateListRecordLogicData({ fields, objects, onSuccess }: { fields: IListField[]; objects: IObject[]; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const createListRecordSchema = useMemo(() => buildListRecordSchema(fields, objects, t), [fields, objects, t]);

  const createListRecordValidatedFormState = useValidatedFormState<Record<string, any>>(createListRecordSchema as any);

  const createListRecordMutation = useMutation({
    mutationFn: () => createListRecordService({
      body: { values: normalizeListRecordValues(fields, objects, createListRecordValidatedFormState.state) },
    }),
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('list.notifications.createError'),
        color: 'red',
      });
    },
  });

  function createListRecordReset() {
    createListRecordValidatedFormState.setState(createListRecordSchema.getDefault() as any);
    createListRecordValidatedFormState.setErrors({});
  }

  return { createListRecordValidatedFormState, createListRecordMutation, createListRecordReset };
}

export function CreateListRecordLogicComponent({
  logicData,
  fields,
  internalLists,
  objects,
  onCancel,
}: {
  logicData: ReturnType<typeof useCreateListRecordLogicData>;
  fields: IListField[];
  internalLists: IInternalList[];
  objects: IObject[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const {
    createListRecordValidatedFormState: { field: recordField, validate: validateRecord },
    createListRecordMutation: { mutate: createListRecord, isPending: createListRecordIsPending },
  } = logicData;

  async function submit() {
    if (!await validateRecord()) return;
    createListRecord();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <DynamicRecordFields
        fields={fields}
        internalLists={internalLists}
        objects={objects}
        field={recordField as any}
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={createListRecordIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          type="submit"
          color="primary"
          loading={createListRecordIsPending}
        >
          {t('common.actions.save')}
        </FormButton>
      </div>
    </Form>
  );
}
