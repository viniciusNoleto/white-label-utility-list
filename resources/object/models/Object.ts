import type { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';

export interface IObjectField {
  id: number;
  object_id: number;
  key: string;
  label: string;
  type: `${EListFieldType}`;
  required: boolean;
  internal_list_id: number | null;
  position: number;
}

export interface IObject {
  id: number;
  key: string;
  name: string;
  fields: IObjectField[];
}
