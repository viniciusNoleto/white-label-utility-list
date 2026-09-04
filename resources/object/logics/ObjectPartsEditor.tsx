'use client';

import { useTranslation } from 'react-i18next';
import { UtilsFor } from '@/src/components/utils/For';
import { FormButton } from '@/src/components/form/Button';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormSelect } from '@/src/components/form/Select';
import { EListFieldType, OBJECT_FIELD_TYPES } from '@/src/resources/list-field/enums/ListFieldType';
import type { IObjectField } from '../models/Object';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';

export type ObjectPartDraft = {
  localId: string;
  id: number | null;
  key: string;
  label: string;
  type: `${EListFieldType}`;
  required: boolean;
  internal_list_id: number | null;
};

let partLocalIdCounter = 0;

export function createEmptyObjectPart(): ObjectPartDraft {
  partLocalIdCounter += 1;

  return {
    localId: `new-${partLocalIdCounter}`,
    id: null,
    key: '',
    label: '',
    type: EListFieldType.TEXT,
    required: false,
    internal_list_id: null,
  };
}

export function objectFieldsToPartDrafts(fields: IObjectField[]): ObjectPartDraft[] {
  return [...fields]
    .sort((a, b) => a.position - b.position)
    .map(field => ({
      localId: `existing-${field.id}`,
      id: field.id,
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      internal_list_id: field.internal_list_id,
    }));
}

export function validatePartDrafts(parts: ObjectPartDraft[], t: (key: string) => string): string | null {
  for (const part of parts) {
    if (!part.label.trim()) return t('admin.settings.objects.parts.validation.labelRequired');
    if (!part.key.trim()) return t('admin.settings.objects.parts.validation.keyRequired');
    if (!/^[a-z0-9_]+$/.test(part.key)) return t('admin.settings.objects.parts.validation.keyFormat');
    if (part.type === EListFieldType.SELECT && !part.internal_list_id) return t('admin.settings.objects.parts.validation.internalListRequired');
  }

  return null;
}

export function ObjectPartsEditor({
  parts,
  onChange,
  internalLists,
}: {
  parts: ObjectPartDraft[];
  onChange: (parts: ObjectPartDraft[]) => void;
  internalLists: IInternalList[];
}) {
  const { t } = useTranslation();

  function updatePart(localId: string, changes: Partial<ObjectPartDraft>) {
    onChange(parts.map(part => part.localId === localId ? { ...part, ...changes } : part));
  }

  function removePart(localId: string) {
    onChange(parts.filter(part => part.localId !== localId));
  }

  function addPart() {
    onChange([...parts, createEmptyObjectPart()]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {t('admin.settings.objects.parts.label')}
        </span>

        <FormButton
          variant="default"
          size="xs"
          leftIcon="lucide:plus"
          onClick={addPart}
        >
          {t('admin.settings.objects.parts.actions.add')}
        </FormButton>
      </div>

      {parts.length === 0 ? (
        <div className="px-4 py-5 text-center text-sm text-gray-400 border border-dashed border-gray-200 dark:border-neutral-700 rounded-lg">
          {t('admin.settings.objects.parts.empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <UtilsFor
            each={parts}
            eachKey={({ item }) => item.localId}
          >
            {({ item: part }) => (
              <div className="flex flex-wrap items-center gap-2">
                <FormTextInput
                  placeholder={t('admin.settings.objects.fields.label.placeholder')}
                  value={part.label}
                  onChange={value => updatePart(part.localId, { label: value })}
                  className="flex-1 min-w-[140px]"
                />

                <FormTextInput
                  placeholder={t('admin.settings.objects.fields.key.placeholder')}
                  value={part.key}
                  onChange={value => updatePart(part.localId, { key: value })}
                  disabled={part.id !== null}
                  className="w-36 font-mono"
                />

                <FormSelect
                  data={OBJECT_FIELD_TYPES.map(value => ({ value, label: t(`admin.settings.fields.types.${value}`) }))}
                  value={part.type}
                  onChange={value => updatePart(part.localId, { type: (value ?? EListFieldType.TEXT) as `${EListFieldType}` })}
                  clearable={false}
                  className="w-40"
                />

                {part.type === EListFieldType.SELECT ? (
                  <FormSelect
                    placeholder={t('admin.settings.fields.internalList.placeholder')}
                    data={internalLists}
                    valueField="id"
                    labelField="name"
                    value={part.internal_list_id}
                    onChange={value => updatePart(part.localId, { internal_list_id: value ? Number(value) : null })}
                    className="w-40"
                  />
                ) : null}

                <FormButton
                  icon="lucide:asterisk"
                  tooltip={t('admin.settings.objects.fields.required.label')}
                  variant={part.required ? 'light' : 'subtle'}
                  color={part.required ? 'primary' : 'gray'}
                  onClick={() => updatePart(part.localId, { required: !part.required })}
                />

                <FormButton
                  icon="lucide:trash-2"
                  variant="subtle"
                  color="red"
                  onClick={() => removePart(part.localId)}
                />
              </div>
            )}
          </UtilsFor>
        </div>
      )}
    </div>
  );
}
