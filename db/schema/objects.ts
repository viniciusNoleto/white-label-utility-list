import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const objects = pgTable('objects', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
});
