import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';
import type { IListField } from '@/src/resources/list-field/models/ListField';
import type { IObject, IObjectField } from '@/src/resources/object/models/Object';

function isObjectFieldFilled(value: any) {
  return value !== undefined && value !== null && value !== '';
}

function scalarFieldToYup({ type, label, required }: { type: `${EListFieldType}`; label: string; required: boolean }, t: TFunction) {
  const requiredMessage = t('list.form.validation.required', { label });

  if (type === EListFieldType.NUMBER) {
    const schema = yup.number().default(null).nullable();
    return required ? schema.required(requiredMessage) : schema.optional();
  }

  const schema = yup.string().default('');
  return required ? schema.required(requiredMessage) : schema.optional();
}

function fieldToYup(field: IListField, objects: IObject[], t: TFunction) {
  if (field.type === EListFieldType.OBJECT) {
    const object = objects.find(o => o.id === field.object_id);
    const objectFields = object?.fields ?? [];
    const shape: Record<string, any> = {};

    objectFields.forEach((objectField) => {
      const required = field.required && objectField.required;
      shape[objectField.key] = scalarFieldToYup({ ...objectField, required }, t);
    });

    let objectSchema: yup.AnyObjectSchema = yup.object(shape);

    if (!field.required) {
      // Objetos opcionais deixados em branco são salvos como `null` (ver normalizeListRecordValues)
      objectSchema = objectSchema.nullable();

      const requiredObjectFields = objectFields.filter(f => f.required);

      if (requiredObjectFields.length > 0) {
        objectSchema = objectSchema.test(
          'conditional-required',
          '',
          function conditionalRequired(this: yup.TestContext, value: Record<string, any> | undefined) {
            if (!value || !objectFields.some(f => isObjectFieldFilled(value[f.key]))) return true;

            const errors = requiredObjectFields
              .filter((f: IObjectField) => !isObjectFieldFilled(value[f.key]))
              .map((f: IObjectField) => this.createError({
                path: `${this.path}.${f.key}`,
                message: t('list.form.validation.required', { label: f.label }),
              }));

            return errors.length ? new yup.ValidationError(errors) : true;
          },
        );
      }
    }

    return objectSchema;
  }

  return scalarFieldToYup(field, t);
}

export function normalizeListRecordValues(fields: IListField[], objects: IObject[], values: Record<string, any>) {
  const normalized: Record<string, any> = { ...values };

  fields.forEach((field) => {
    if (field.type !== EListFieldType.OBJECT || field.required) return;

    const object = objects.find(o => o.id === field.object_id);
    const objectFields = object?.fields ?? [];
    const value = normalized[field.key];

    if (!value || objectFields.some(f => isObjectFieldFilled(value[f.key]))) return;

    normalized[field.key] = null;
  });

  return normalized;
}

export function buildListRecordSchema(fields: IListField[], objects: IObject[], t: TFunction) {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    shape[field.key] = fieldToYup(field, objects, t);
  });

  return yup.object(shape);
}
