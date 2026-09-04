'use client';

import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormButton } from '@/src/components/form/Button';
import { resolveApiMessage } from '@/src/utils/apiMessage';
import { createObjectFieldService } from '../services/createObjectField';
import { updateObjectFieldService } from '../services/updateObjectField';
import { deleteObjectFieldService } from '../services/deleteObjectField';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';
import { ObjectPartsEditor, objectFieldsToPartDrafts, validatePartDrafts, type ObjectPartDraft } from './ObjectPartsEditor';
import type { IObject } from '../models/Object';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';

export function useUpdateObjectPartsLogicData({ object, onSuccess }: { object: IObject; onSuccess: () => void }) {
  const { t, i18n } = useTranslation();
  const [updateObjectParts, setUpdateObjectParts] = useState<ObjectPartDraft[]>(() => objectFieldsToPartDrafts(object.fields));
  const [updateObjectPartsError, setUpdateObjectPartsError] = useState<string | null>(null);

  const updateObjectPartsMutation = useMutation({
    mutationFn: async () => {
      const originalById = new Map(object.fields.map(field => [field.id, field]));
      const remainingIds = new Set(updateObjectParts.filter(part => part.id !== null).map(part => part.id));
      const removedFields = object.fields.filter(field => !remainingIds.has(field.id));

      const writes = updateObjectParts.map((part, position) => {
        const internalListId = part.type === EListFieldType.SELECT ? part.internal_list_id : null;

        if (part.id === null) {
          return createObjectFieldService({
            objectId: object.id,
            body: { key: part.key, label: part.label, type: part.type, required: part.required, internal_list_id: internalListId },
          });
        }

        const original = originalById.get(part.id)!;
        const changed = original.label !== part.label
          || original.type !== part.type
          || original.required !== part.required
          || (original.internal_list_id ?? null) !== internalListId
          || original.position !== position;

        if (!changed) return null;

        return updateObjectFieldService({
          objectId: object.id,
          fieldId: part.id,
          body: { label: part.label, type: part.type, required: part.required, internal_list_id: internalListId, position },
        });
      });

      await Promise.all([
        ...removedFields.map(field => deleteObjectFieldService({ objectId: object.id, fieldId: field.id })),
        ...writes.filter(write => write !== null),
      ]);
    },
    onSuccess: () => {
      notifications.show({ message: t('admin.settings.objects.parts.notifications.saveSuccess'), color: 'green' });
      onSuccess();
    },
    onError: (err: any) => {
      notifications.show({
        title: t('common.notifications.errorTitle'),
        message: err?.message ? resolveApiMessage(err.message, i18n.language) : t('admin.settings.objects.parts.notifications.saveError'),
        color: 'red',
      });
    },
  });

  function updateObjectPartsReset() {
    setUpdateObjectParts(objectFieldsToPartDrafts(object.fields));
    setUpdateObjectPartsError(null);
  }

  return {
    updateObjectParts,
    setUpdateObjectParts,
    updateObjectPartsError,
    setUpdateObjectPartsError,
    updateObjectPartsMutation,
    updateObjectPartsReset,
  };
}

export function UpdateObjectPartsLogicComponent({
  logicData,
  internalLists,
  onCancel,
}: {
  logicData: ReturnType<typeof useUpdateObjectPartsLogicData>;
  internalLists: IInternalList[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const {
    updateObjectParts,
    setUpdateObjectParts,
    updateObjectPartsError,
    setUpdateObjectPartsError,
    updateObjectPartsMutation: { mutate: saveObjectParts, isPending: updateObjectPartsIsPending },
  } = logicData;

  function submit() {
    const partsError = validatePartDrafts(updateObjectParts, t);
    setUpdateObjectPartsError(partsError);
    if (partsError) return;

    saveObjectParts();
  }

  return (
    <div className="flex flex-col gap-6">
      <ObjectPartsEditor
        parts={updateObjectParts}
        onChange={setUpdateObjectParts}
        internalLists={internalLists}
      />

      {updateObjectPartsError ? (
        <p className="text-sm text-red-600">
          {updateObjectPartsError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <FormButton
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={updateObjectPartsIsPending}
        >
          {t('common.actions.cancel')}
        </FormButton>

        <FormButton
          color="primary"
          loading={updateObjectPartsIsPending}
          onClick={submit}
        >
          {t('admin.settings.objects.parts.actions.save')}
        </FormButton>
      </div>
    </div>
  );
}
