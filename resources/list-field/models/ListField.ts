import type { EListFieldType } from '../enums/ListFieldType';

export interface IListField {
  id: number;
  key: string;
  label: string;
  type: `${EListFieldType}`;
  required: boolean;
  internal_list_id: number | null;
  object_id: number | null;
  position: number;
}
