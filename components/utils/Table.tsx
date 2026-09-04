import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

import { UtilsFor } from '@/src/components/utils/For';
import { FormButton, type FormButtonProps } from '../form/Button';
import { UtilsIf } from './If';
import { LoadingOverlay, Pagination } from '@mantine/core';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type TableProps<T extends object, U extends Record<string, string>> = {
  title?: string;
  rows: T[];
  columns: U;
  loading?: boolean;
  emptyText?: string;
  alias?: React.ReactNode;
  rowKey?: TableRowKey<T>;
  actions?: TableActions<T>;
  renderCells?: TableRenderCells<T, U>;
  onReorder?: (ctx: { item: T; index: number; newIndex: number }) => void;
  showRowNumber?: boolean;
} & (
  {
    lastPage: number;
    page: number;
    perPage: number;
    setPage: (page: number) => void;
  } | {
    lastPage?: never;
    page?: never;
    perPage?: never;
    setPage?: never;
  }
);

const ROW_NUMBER_FIELD = '__row_number';

const TableDragHandleContext = React.createContext<TableDragHandleContextValue | null>(null);

export function UtilsTableDragHandle() {
  const dragHandle = React.useContext(TableDragHandleContext);

  return (
    <button
      type="button"
      ref={dragHandle?.setActivatorNodeRef}
      className="inline-flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
      {...dragHandle?.attributes}
      {...dragHandle?.listeners}
    >
      <Icon
        icon="lucide:grip-vertical"
        className="w-4 h-4"
      />
    </button>
  );
}

export function UtilsTable<T extends object, U extends Record<string, string>>({
  title = '',
  columns,
  rows,
  loading = false,
  emptyText,
  lastPage,
  page,
  perPage,
  alias,
  setPage,
  rowKey,
  actions,
  renderCells,
  onReorder,
  showRowNumber = false,
}: TableProps<T, U>) {
  const { t } = useTranslation();

  const showActions = useMemo(() => actions && (typeof actions === 'function' || actions.length > 0), [actions]);

  const rowNumberOffset = useMemo(() => (page && perPage ? (page - 1) * perPage : 0), [page, perPage]);

  const _columns = useMemo(() => {
    const entries = Object.entries(columns).map(([field, label]) => ({ field, label }));
    const orderIdx = entries.findIndex(({ field }) => field === 'order');

    if (orderIdx > 0) {
      const [orderColumn] = entries.splice(orderIdx, 1);
      entries.unshift(orderColumn);
    }

    if (showRowNumber) {
      entries.unshift({ field: ROW_NUMBER_FIELD, label: '#' });
    }

    return entries;
  }, [columns, showRowNumber]);

  const colCount = useMemo(() => _columns.length + (showActions ? 1 : 0), [_columns, showActions]);

  const rowIds = useMemo(() => rows.map((row, rowIdx) => (rowKey?.({ item: row, index: rowIdx }) ?? rowIdx) as string | number), [rows, rowKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rowIds.indexOf(active.id as string | number);
    const newIndex = rowIds.indexOf(over.id as string | number);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder?.({ item: rows[oldIndex], index: oldIndex, newIndex });
  }

  const renderRowCells = (row: T, rowIdx: number) => (
    <>
      <UtilsFor
        each={_columns}
        eachKey={({item: column}) => column.field}
      >
        {({item: column}) => (
          <td className={`px-6 py-4 text-sm whitespace-nowrap ${column.field === 'actions' || column.field === ROW_NUMBER_FIELD ? 'text-center' : ''} ${column.field === ROW_NUMBER_FIELD ? 'sticky left-0 z-[1] bg-white dark:bg-neutral-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40' : ''}`}>
            {
              renderCells && renderCells[column.field] ?
                renderCells[column.field]!({
                  item: row,
                  index: rowIdx,
                })
                  : column.field === ROW_NUMBER_FIELD ?
                    rowNumberOffset + rowIdx + 1
                    :
                    (row as any)[column.field]
            }
          </td>
        )}
      </UtilsFor>

      {showActions ? (
        <td className="px-6 py-4 text-center sticky right-0 z-1 bg-white dark:bg-neutral-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40">
          <div className="flex items-center justify-center gap-2">
            <UtilsFor each={typeof actions === 'function' ? actions({ item: row, index: rowIdx }) : (actions || [])}>
              {({item: action}) => (
                <FormButton
                  {...action}
                  size="compact-xs"
                  variant="transparent"
                  aria-label={action.label}
                  label={action.icon ? undefined : action.label}
                  tooltip={action.label}
                  onClick={() => action.onClick?.({ item: row, index: rowIdx })}
                />
              )}
            </UtilsFor>
          </div>
        </td>
      ) : null}
    </>
  );

  return (
    <section className="flex flex-col gap-2">
      <UtilsIf condition={title}>
        {() => (
          <section className="flex items-center justify-between gap-4 px-2">
            <span className="text-lg font-semibold">{title}</span>

            {alias}
          </section>
        )}
      </UtilsIf>

      <section className="flex flex-col relative">
        <LoadingOverlay
          visible={loading}
          zIndex={2}
          overlayProps={{ blur: 2 }}
          loaderProps={{ color: 'primary', type: 'bars' }}
        />

        <section className="overflow-x-auto">
          <table className="w-max min-w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50 dark:bg-neutral-800/40">
                <UtilsFor
                  each={_columns}
                  eachKey={({item: column}) => column.field}
                >
                  {({item: column}) => (
                    <th
                      key={column.field}
                      scope="col"
                      className={`px-6 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap ${column.field === 'actions' || column.field === ROW_NUMBER_FIELD ? 'text-center' : ''} ${column.field === ROW_NUMBER_FIELD ? 'sticky left-0 z-[1] bg-gray-50 dark:bg-neutral-800/40' : ''}`}
                    >
                      {column.field === 'order' ? null : column.label}
                    </th>
                  )}
                </UtilsFor>

                {showActions ? (
                  <th
                    scope="col"
                    className="px-6 py-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center sticky right-0 z-[1] bg-gray-50 dark:bg-neutral-800/40"
                  >
                    {t('common.table.actionsColumn')}
                  </th>
                ) : null}
              </tr>
            </thead>

            <UtilsIf condition={!!onReorder}>
              {() => (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rowIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      <UtilsFor
                        each={rows}
                        eachKey={({ index: rowIdx }) => rowIds[rowIdx]}
                        empty={
                          <tr>
                            <td
                              colSpan={colCount}
                              className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                              {emptyText ?? t('common.table.emptyDefault')}
                            </td>
                          </tr>
                        }
                      >
                        {({item: row, index: rowIdx}) => (
                          <SortableTableRow id={rowIds[rowIdx]}>
                            {renderRowCells(row, rowIdx)}
                          </SortableTableRow>
                        )}
                      </UtilsFor>
                    </tbody>
                  </SortableContext>
                </DndContext>
              )}
            </UtilsIf>

            <UtilsIf condition={!onReorder}>
              {() => (
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <UtilsFor
                    each={rows}
                    eachKey={({ index: rowIdx }) => rowIds[rowIdx]}
                    empty={
                      <tr>
                        <td
                          colSpan={colCount}
                          className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          {emptyText ?? t('common.table.emptyDefault')}
                        </td>
                      </tr>
                    }
                  >
                    {({item: row, index: rowIdx}) => (
                      <tr className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                        {renderRowCells(row, rowIdx)}
                      </tr>
                    )}
                  </UtilsFor>
                </tbody>
              )}
            </UtilsIf>
          </table>
        </section>

        <UtilsIf condition={!!(lastPage && lastPage > 1)}>
          {() => (
            <div className="flex justify-center pt-4 border-t border-gray-50 dark:border-gray-800 mt-2">
              <Pagination
                total={lastPage ?? 0}
                value={page ?? 1}
                onChange={page => setPage?.(page)}
                color="primary"
              />
            </div>
          )}
        </UtilsIf>
      </section>
    </section>
  );
}

function SortableTableRow({ id, children }: { id: string | number; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandleValue = useMemo(() => ({ attributes, listeners, setActivatorNodeRef }), [attributes, listeners, setActivatorNodeRef]);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors ${isDragging ? 'relative z-10 bg-white dark:bg-neutral-900 shadow-lg' : ''}`}
    >
      <TableDragHandleContext.Provider value={dragHandleValue}>
        {children}
      </TableDragHandleContext.Provider>
    </tr>
  );
}

type TableDragHandleContextValue = {
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
};

type TableRenderCells<T extends object, U extends Record<string, string>> = Partial<Record<keyof U, (ctx: { item: T, index: number }) => React.ReactNode|string>>;

type TableRowKey<T extends object> = (ctx: { item: T, index: number }) => React.Key;

type TableAction<T extends object> = Omit<FormButtonProps, 'onClick'> & {
  label?: string;
  icon?: string;
  onClick?: (ctx: { item: T, index: number }) => void;
}

type TableActions<T extends object> = TableAction<T>[] | ((ctx: { item: T, index: number }) => TableAction<T>[]);
