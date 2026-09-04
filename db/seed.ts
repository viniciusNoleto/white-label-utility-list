import { config } from 'dotenv';

config({ path: '.env' });

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { internalLists, internalListItems, objects, objectFields, listFields, listColumns, users } from './schema';
import { hashPassword } from '../libs/auth/password';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const db = drizzle(pool, { schema });

async function upsertInternalList(key: string, name: string) {
  const [existing] = await db.select().from(internalLists).where(eq(internalLists.key, key)).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(internalLists).values({ key, name }).returning();
  return created;
}

async function upsertObject(key: string, name: string) {
  const [existing] = await db.select().from(objects).where(eq(objects.key, key)).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(objects).values({ key, name }).returning();
  return created;
}

async function upsertObjectField(data: {
  object_id: number;
  key: string;
  label: string;
  type: 'text' | 'long_text' | 'date' | 'select' | 'number';
  required: boolean;
  internal_list_id?: number | null;
  position: number;
}) {
  const existingRows = await db.select().from(objectFields).where(eq(objectFields.object_id, data.object_id));
  const already = existingRows.find(f => f.key === data.key);
  if (already) return already;

  const [created] = await db.insert(objectFields).values(data).returning();
  return created;
}

async function upsertListField(data: {
  key: string;
  label: string;
  type: 'text' | 'long_text' | 'date' | 'select' | 'object' | 'number';
  required: boolean;
  internal_list_id?: number | null;
  object_id?: number | null;
  position: number;
}) {
  const [existing] = await db.select().from(listFields).where(eq(listFields.key, data.key)).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(listFields).values(data).returning();
  return created;
}

async function upsertListColumn(data: { field_key: string; sub_path?: string | null; label: string; position: number }) {
  const existingRows = await db
    .select()
    .from(listColumns)
    .where(eq(listColumns.field_key, data.field_key))
    .limit(1000);

  const already = existingRows.find(c => c.field_key === data.field_key && (c.sub_path ?? null) === (data.sub_path ?? null));
  if (already) return already;

  const [created] = await db.insert(listColumns).values(data).returning();
  return created;
}

async function seed() {
  console.log('Seeding "responsaveis" internal list...');
  const responsaveis = await upsertInternalList('responsaveis', 'Responsáveis');

  const existingItems = await db.select().from(internalListItems).where(eq(internalListItems.list_id, responsaveis.id));
  if (existingItems.length === 0) {
    await db.insert(internalListItems).values([
      { list_id: responsaveis.id, label: 'Equipe Técnica', position: 0 },
    ]);
  }

  console.log('Seeding "pessoa" object...');
  const pessoa = await upsertObject('pessoa', 'Pessoa');

  await upsertObjectField({ object_id: pessoa.id, key: 'nome', label: 'Nome', type: 'text', required: true, position: 0 });
  await upsertObjectField({ object_id: pessoa.id, key: 'contato', label: 'Contato', type: 'text', required: false, position: 1 });
  await upsertObjectField({ object_id: pessoa.id, key: 'sus', label: 'Número do SUS', type: 'text', required: false, position: 2 });
  await upsertObjectField({ object_id: pessoa.id, key: 'endereco', label: 'Endereço', type: 'text', required: false, position: 3 });

  console.log('Seeding list fields...');
  await upsertListField({
    key: 'requisitante',
    label: 'Responsável',
    type: 'select',
    required: true,
    internal_list_id: responsaveis.id,
    position: 0,
  });

  await upsertListField({
    key: 'data',
    label: 'Data',
    type: 'date',
    required: true,
    position: 1,
  });

  await upsertListField({
    key: 'pessoa1',
    label: 'Solicitante',
    type: 'object',
    required: true,
    object_id: pessoa.id,
    position: 2,
  });

  await upsertListField({
    key: 'pessoa2',
    label: 'Relacionado',
    type: 'object',
    required: false,
    object_id: pessoa.id,
    position: 3,
  });

  await upsertListField({
    key: 'observacao',
    label: 'Observação',
    type: 'long_text',
    required: false,
    position: 4,
  });

  console.log('Seeding list columns...');
  const columnsInOrder: { field_key: string; sub_path?: string; label: string }[] = [
    { field_key: 'requisitante', label: 'Requisitante' },
    { field_key: 'data', label: 'Data' },
    { field_key: 'pessoa1', sub_path: 'nome', label: 'Solicitante' },
    { field_key: 'pessoa1', sub_path: 'contato', label: 'Contato' },
    { field_key: 'pessoa1', sub_path: 'sus', label: 'SUS' },
    { field_key: 'pessoa2', sub_path: 'nome', label: 'Relacionado' },
    { field_key: 'observacao', label: 'Observação' },
    { field_key: 'pessoa1', sub_path: 'endereco', label: 'Endereço' },
  ];

  for (let i = 0; i < columnsInOrder.length; i++) {
    await upsertListColumn({ ...columnsInOrder[i], position: i });
  }

  const adminName = process.env.SEED_ADMIN_NAME;
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminName && adminEmail && adminPassword) {
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (!existingAdmin) {
      console.log(`Creating admin user "${adminEmail}"...`);
      await db.insert(users).values({
        name: adminName,
        email: adminEmail,
        password_hash: await hashPassword(adminPassword),
        role: 'admin',
        status: 'approved',
      });
    } else {
      console.log(`Admin user "${adminEmail}" already exists, skipping.`);
    }
  } else {
    console.warn('SEED_ADMIN_NAME/SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set — skipping admin user creation.');
  }

  console.log('Seed complete.');
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
