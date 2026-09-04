import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';

export const listColumns = pgTable('list_columns', {
  id: serial('id').primaryKey(),
  field_key: varchar('field_key', { length: 100 }).notNull(),
  sub_path: varchar('sub_path', { length: 50 }),
  label: varchar('label', { length: 150 }).notNull(),
  position: integer('position').notNull().default(0),
});
