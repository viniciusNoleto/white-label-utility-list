import { config } from 'dotenv';

config({ path: '.env' });

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { users } from './schema';
import { hashPassword } from '../libs/auth/password';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const db = drizzle(pool, { schema });

async function seed() {
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
