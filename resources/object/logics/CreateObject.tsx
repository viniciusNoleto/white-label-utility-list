'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/src/components/form/Form';
import { FormButton } from '@/src/components/form/Button';
import { FormTextInput } from '@/src/components/form/TextInput';
import { useValidatedFormState } from '@/src/utils/state';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { createObjectService } from '../services/createObject';
import { createObjectFieldService } from '../services/createObjectField';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';
import { ObjectPartsEditor, validatePartDrafts, type ObjectPartDraft } from './ObjectPartsEditor';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';

export function useCreateObjectLogicData({ onSuccess }: { onSuccess: () => void }) {
  const { t, i18n } = useTranslation();

  const createObjectSchema = useMemo(() => yup.object({
    key: yup.string().default('').required(t('admin.settings.objects.validation.keyRequired')).matches(/^[a-z0-9_]+$/, t('admin.settings.objects.validation.keyFormat')),
    name: yup.string().default('').required(t('admin.settings.objects.validation.nameRequired')),
  }), [t]);

  const createObjectValidatedFormState = useValidatedFormState(createObjectSchema);
  const [createObjectParts, setCreateObjectParts] = useState<ObjectPartDraft[]>([]);
  const [createObjectPartsError, setCreateObjectPartsError] = useState<string | null>(null);

  const createObjectMutation = useMutation({
    mutationFn: async () => {
      const res = await createObjectService({ body: createObjectValidatedFormState.state });

      await Promise.all(createObjectParts.map(part => createObjectFieldService({
        objectId: res.data.id,
        body: {
          key: part.key,
          label: part.label,
          type: part.type,
          required: part.required,
          internal_list_id: part.type === EListFieldType.SELECT ? part.internal_list_id : null,
        },
      })));

      return res;
    },
    onSuccess: (res) => {
      notifications.show({ message: resolveApiMessage(res.message, i18n.language), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.objects.notifications.createError'),
        color: 'red',
      });
    },
  });

  function createObjectReset() {
    createObjectValidatedFormState.setState(createObjectSchema.getDefault());
    createObjectValidatedFormState.setErrors({});
    setCreateObjectParts([]);
    setCreateObjectPartsError(null);
  }

  return {
    createObjectValidatedFormState,
    createObjectParts,
    setCreateObjectParts,
    createObjectPartsError,
    setCreateObjectPartsError,
    createObjectMutation,
    createObjectReset,
  };
}

export function CreateObjectLogicComponent({
  logicData,
  internalLists,
  onCancel,
}: {
  logicData: ReturnType<typeof useCreateObjectLogicData>;
  internalLists: IInternalList[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const {
    createObjectValidatedFormState: { field: objectField, validate: validateObject },
    createObjectParts,
    setCreateObjectParts,
    createObjectPartsError,
    setCreateObjectPartsError,
    createObjectMutation: { mutate: createObject, isPending: createObjectIsPending },
  } = logicData;

  async function submit() {
    if (!await validateObject()) return;

    const partsError = validatePartDrafts(createObjectParts, t);
    setCreateObjectPartsError(partsError);
    if (partsError) return;

    createObject();
  }

  return (
    <Form
      onSubmit={submit}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <FormTextInput
          label={t('admin.settings.objects.name.label')}
          placeholder={t('admin.settings.objects.name.placeholder')}
          {...objectField('name')}
          required
        />

        <FormTextInput
          label={t('admin.settings.objects.key.label')}
          placeholder={t('admin.settings.objects.key.placeholder')}
          description={t('admin.settings.objects.key.description')}
          {...objectField('key')}
          required
        />
      </div>

      <ObjectPartsEditor
        parts={createObjectParts}
        onChange={setCreateObjectParts}
        internalLists={internalLists}
      />

      {createObjectPartsError ? (
        <p className="text-sm text-red-600">
          {createObjectPartsError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={createObjectIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          type="submit"
          color="primary"
          loading={createObjectIsPending}
        >
          {t('common.actions.save')}
        </FormButton>
      </div>
    </Form>
  );
}
