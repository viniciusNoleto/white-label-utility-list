import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { accessTokens } from './access-tokens';

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  access_token_id: integer('access_token_id').notNull().references(() => accessTokens.id, { onDelete: 'cascade' }),
  family_id: varchar('family_id', { length: 64 }).notNull(),
  token_hash: varchar('token_hash', { length: 64 }).notNull().unique(),
  is_revoked: boolean('is_revoked').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
