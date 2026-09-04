import type { EInternalListDisplayStyle } from '../enums/InternalListDisplayStyle';
import type { EInternalListItemColor } from '../enums/InternalListItemColor';

export interface IInternalListItem {
  id: number;
  list_id: number;
  label: string;
  position: number;
  color: `${EInternalListItemColor}` | null;
}

export interface IInternalList {
  id: number;
  key: string;
  name: string;
  display_style: `${EInternalListDisplayStyle}`;
  items: IInternalListItem[];
}
