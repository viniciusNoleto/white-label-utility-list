import { pgTable, serial, integer, varchar } from 'drizzle-orm/pg-core';
import { internalLists } from './internal-lists';

export const internalListItems = pgTable('internal_list_items', {
  id: serial('id').primaryKey(),
  list_id: integer('list_id').notNull().references(() => internalLists.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 255 }).notNull(),
  position: integer('position').notNull().default(0),
  color: varchar('color', { length: 20 }),
});
