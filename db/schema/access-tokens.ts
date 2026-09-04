import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

// Access token opaco (não é JWT) — espelha `personal_access_tokens` do
// backend de referência (~/vedex/eventure-api). Validade não é embutida no
// token: é calculada a cada request como tempo decorrido desde
// `created_at` (ver libs/auth/tokens.ts, ACCESS_TOKEN_TTL_MS) — ao detectar
// expiração, a linha é marcada `is_revoked = true` no mesmo momento, nunca
// deletada. `token_hash` guarda o sha256 do token (nunca o valor em texto
// plano — único desvio deliberado da referência, que guarda em texto
// plano; ver docs/auth/reference-backend-analysis.md).
export const accessTokens = pgTable('access_tokens', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token_hash: varchar('token_hash', { length: 64 }).notNull().unique(),
  is_revoked: boolean('is_revoked').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
