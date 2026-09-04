import { pgTable, serial, integer, varchar, boolean } from 'drizzle-orm/pg-core';
import { objects } from './objects';
import { internalLists } from './internal-lists';
import type { ListFieldType } from './list-fields';

export type ObjectFieldType = Exclude<ListFieldType, 'object'>;

export const objectFields = pgTable('object_fields', {
  id: serial('id').primaryKey(),
  object_id: integer('object_id').notNull().references(() => objects.id, { onDelete: 'cascade' }),
  key: varchar('key', { length: 100 }).notNull(),
  label: varchar('label', { length: 150 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().$type<ObjectFieldType>(),
  required: boolean('required').notNull().default(false),
  internal_list_id: integer('internal_list_id').references(() => internalLists.id),
  position: integer('position').notNull().default(0),
});
