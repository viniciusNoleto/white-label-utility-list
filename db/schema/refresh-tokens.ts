import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { accessTokens } from './access-tokens';

// Refresh token opaco — espelha `refresh_tokens` do backend de referência
// (~/vedex/eventure-api). Substitui a antiga tabela `sessions`.
//
// - `access_token_id`: FK para o access token emitido junto (mesmo padrão
//   de `personal_access_token_id` na referência) — usado por
//   GET /api/auth/token para achar o refresh token do access token atual
//   sem precisar que o cliente o reenvie, e por logout, para revogar os
//   dois de uma vez.
// - `family_id`: identifica a "linhagem" de tokens nascida em um único
//   login. Toda rotação (ver libs/auth/refreshToken.ts, rotateSession)
//   preserva o `family_id` da linha anterior. Se uma linha com
//   `is_revoked = true` for apresentada de novo, é reuso de um token já
//   trocado por um mais novo — sinal de possível roubo — e a família
//   inteira é revogada.
// - `is_revoked`: rotação/expiração/logout marcam a linha revogada; nunca
//   deletam. Guardar o histórico é o que permite detectar reuso acima.
export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  access_token_id: integer('access_token_id').notNull().references(() => accessTokens.id, { onDelete: 'cascade' }),
  family_id: varchar('family_id', { length: 64 }).notNull(),
  token_hash: varchar('token_hash', { length: 64 }).notNull().unique(),
  is_revoked: boolean('is_revoked').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
