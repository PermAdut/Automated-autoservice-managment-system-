import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import * as schema from '../../drizzle/schema';

config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;
  public db: ReturnType<typeof drizzle>;

  constructor() {
    const targetSchema = 'autoservice';

    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      // Make sure we write and read from the autoservice schema by default
      options: `-c search_path=${targetSchema},public`,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    // Test connection
    try {
      await this.pool.query('SELECT NOW()');
      console.log('Database connection established');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async getClient() {
    return await this.pool.connect();
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
