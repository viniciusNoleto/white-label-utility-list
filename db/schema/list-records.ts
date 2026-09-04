import { pgTable, serial, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const listRecords = pgTable('list_records', {
  id: serial('id').primaryKey(),
  values: jsonb('values').$type<Record<string, any>>().notNull(),
  created_by: integer('created_by').references(() => users.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
