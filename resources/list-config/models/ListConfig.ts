import type { IListField } from '@/src/resources/list-field/models/ListField';
import type { IListColumn } from '@/src/resources/list-column/models/ListColumn';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';
import type { IObject } from '@/src/resources/object/models/Object';

export interface IListConfig {
  fields: IListField[];
  columns: IListColumn[];
  internal_lists: IInternalList[];
  objects: IObject[];
}
