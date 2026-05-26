import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'autoservice_db',
  });

  try {
    console.log('Dropping database objects...');
    await pool.query('DROP SCHEMA IF EXISTS autoservice CASCADE');
    await pool.query('DROP TABLE IF EXISTS public."__drizzle_migrations" CASCADE');
    await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
    console.log('Database reset completed.');
  } finally {
    await pool.end();
  }
}

resetDatabase().catch((error) => {
  console.error('Database reset failed:', error);
  process.exit(1);
});
