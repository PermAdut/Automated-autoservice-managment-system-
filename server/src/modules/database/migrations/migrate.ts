import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'autoservice',
  });

  const db = drizzle(pool);

  console.log('Running migrations...');

  // Get the migrations folder path relative to the project root
  const migrationsFolder = path.resolve(process.cwd(), 'drizzle');

  await migrate(db, {
    migrationsFolder,
  });

  console.log('Migrations completed!');
  await pool.end();
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { runMigrations };
