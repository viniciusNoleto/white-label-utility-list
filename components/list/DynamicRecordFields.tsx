'use client';

import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { FormTextInput } from '@/src/components/form/TextInput';
import { FormTextarea } from '@/src/components/form/Textarea';
import { FormDatePicker } from '@/src/components/form/DatePicker';
import { FormSelect } from '@/src/components/form/Select';
import { FormNumberInput } from '@/src/components/form/Number';
import { UtilsFor } from '@/src/components/utils/For';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';
import type { IListField } from '@/src/resources/list-field/models/ListField';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';
import type { IObject } from '@/src/resources/object/models/Object';

type FieldAccessor = (path: string) => { value: any; error?: string; onChange: (value: any) => void; onValidate?: () => void };

function renderFieldWidget({
  type,
  label,
  required,
  path,
  internalListId,
  internalLists,
  field,
  t,
}: {
  type: `${EListFieldType}`;
  label: string;
  required: boolean;
  path: string;
  internalListId: number | null;
  internalLists: IInternalList[];
  field: FieldAccessor;
  t: TFunction;
}) {
  if (type === EListFieldType.SELECT) {
    const options = internalLists.find(l => l.id === internalListId)?.items ?? [];

    return (
      <FormSelect
        label={label}
        placeholder={t('list.form.select.placeholder')}
        data={options}
        valueField="label"
        labelField="label"
        {...field(path)}
        required={required}
      />
    );
  }

  if (type === EListFieldType.DATE) {
    return (
      <FormDatePicker
        label={label}
        {...field(path)}
        required={required}
      />
    );
  }

  if (type === EListFieldType.NUMBER) {
    return (
      <FormNumberInput
        label={label}
        {...field(path)}
        required={required}
      />
    );
  }

  if (type === EListFieldType.LONG_TEXT) {
    return (
      <FormTextarea
        label={label}
        rows={4}
        {...field(path)}
        required={required}
      />
    );
  }

  return (
    <FormTextInput
      label={label}
      {...field(path)}
      required={required}
    />
  );
}

export function DynamicRecordFields({
  fields,
  internalLists,
  objects,
  field,
}: {
  fields: IListField[];
  internalLists: IInternalList[];
  objects: IObject[];
  field: FieldAccessor;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
      <UtilsFor
        each={[...fields].sort((a, b) => a.position - b.position)}
        eachKey={({ item }) => item.id}
      >
        {({ item: listField }) => {
          if (listField.type === EListFieldType.OBJECT) {
            const object = objects.find(o => o.id === listField.object_id);
            const objectFields = object ? [...object.fields].sort((a, b) => a.position - b.position) : [];

            return (
              <div className="sm:col-span-2 flex flex-col gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-neutral-800/40">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-[11px] font-medium">
                    {t('list.form.objectBadge')}
                  </span>

                  <span className="text-sm font-medium">
                    {listField.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <UtilsFor
                    each={objectFields}
                    eachKey={({ item }) => item.id}
                  >
                    {({ item: objectField }) => renderFieldWidget({
                      type: objectField.type,
                      label: objectField.label,
                      required: listField.required && objectField.required,
                      path: `${listField.key}.${objectField.key}`,
                      internalListId: objectField.internal_list_id,
                      internalLists,
                      field,
                      t,
                    })}
                  </UtilsFor>
                </div>
              </div>
            );
          }

          const widget = renderFieldWidget({
            type: listField.type,
            label: listField.label,
            required: listField.required,
            path: listField.key,
            internalListId: listField.internal_list_id,
            internalLists,
            field,
            t,
          });

          return listField.type === EListFieldType.LONG_TEXT ? (
            <div className="sm:col-span-2">
              {widget}
            </div>
          ) : widget;
        }}
      </UtilsFor>
    </div>
  );
}
