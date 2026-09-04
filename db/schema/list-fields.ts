import { pgTable, serial, integer, varchar, boolean } from 'drizzle-orm/pg-core';
import { internalLists } from './internal-lists';
import { objects } from './objects';

export type ListFieldType = 'text' | 'long_text' | 'date' | 'select' | 'object' | 'number';

export const listFields = pgTable('list_fields', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  label: varchar('label', { length: 150 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().$type<ListFieldType>(),
  required: boolean('required').notNull().default(false),
  internal_list_id: integer('internal_list_id').references(() => internalLists.id),
  object_id: integer('object_id').references(() => objects.id),
  position: integer('position').notNull().default(0),
});
