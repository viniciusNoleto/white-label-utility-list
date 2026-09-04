import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const internalLists = pgTable('internal_lists', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  display_style: varchar('display_style', { length: 20 }).notNull().default('text'),
});
