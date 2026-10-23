import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const accessTokens = pgTable('access_tokens', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: varchar('token_hash', { length: 64 }).notNull().unique(),
  is_revoked: boolean('is_revoked').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
