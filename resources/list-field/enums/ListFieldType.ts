export enum EListFieldType {
  TEXT = 'text',
  LONG_TEXT = 'long_text',
  DATE = 'date',
  SELECT = 'select',
  OBJECT = 'object',
  NUMBER = 'number',
}

export const OBJECT_FIELD_TYPES = Object.values(EListFieldType).filter(type => type !== EListFieldType.OBJECT);
