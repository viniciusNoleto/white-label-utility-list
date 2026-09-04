import _get from 'lodash-es/get';
import { Badge } from '@mantine/core';
import { EListFieldType } from '@/src/resources/list-field/enums/ListFieldType';
import { EInternalListDisplayStyle } from '@/src/resources/internal-list/enums/InternalListDisplayStyle';
import type { IListColumn } from '@/src/resources/list-column/models/ListColumn';
import type { IListField } from '@/src/resources/list-field/models/ListField';
import type { IInternalList } from '@/src/resources/internal-list/models/InternalList';

export function formatColumnValue(
  values: Record<string, any>,
  column: IListColumn,
  fieldsByKey: Record<string, IListField>,
  internalListsById: Record<number, IInternalList>,
) {
  const field = fieldsByKey[column.field_key];
  const raw = column.sub_path
    ? _get(values, `${column.field_key}.${column.sub_path}`)
    : values[column.field_key];

  if (raw === null || raw === undefined || raw === '') return '—';

  if (field?.type === EListFieldType.DATE && typeof raw === 'string') {
    const [year, month, day] = raw.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
  }

  if (field?.type === EListFieldType.SELECT && field.internal_list_id) {
    const list = internalListsById[field.internal_list_id];

    if (list?.display_style === EInternalListDisplayStyle.BADGE) {
      const item = list.items.find(listItem => listItem.label === raw);

      return (
        <Badge
          color={item?.color ?? 'gray'}
          variant="light"
          radius="xl"
        >
          {String(raw)}
        </Badge>
      );
    }
  }

  return String(raw);
}
