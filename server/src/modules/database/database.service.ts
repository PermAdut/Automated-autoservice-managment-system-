import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import * as schema from '../../drizzle/schema';

config();

/**
 * PostgreSQL connection service.
 *
 * Exposes two Drizzle instances:
 *  - `db`     — primary connection (read + write). Use for all mutations.
 *  - `readDb` — read-only replica (SELECT only). Falls back to primary
 *               when DB_READ_HOST is not configured.
 *
 * To enable a PostgreSQL read replica, set:
 *   DB_READ_HOST=replica.host
 *   DB_READ_PORT=5432 (optional, defaults to 5432)
 *
 * This allows analytics, reports, and heavy SELECT queries to hit the
 * replica, reducing load on the primary.
 *
 * Connection pooling note:
 *   In production, point DB_HOST to PgBouncer (port 6432) for connection
 *   pooling. PgBouncer multiplexes thousands of app connections into a
 *   small number of real PostgreSQL connections.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private writePool: Pool;
  private readPool: Pool;

  /** Primary pool — use for INSERT, UPDATE, DELETE and most queries */
  public db: ReturnType<typeof drizzle>;

  /**
   * Read-only replica pool — use for heavy analytics / report queries.
   * Falls back to the primary pool if DB_READ_HOST is not set.
   */
  public readDb: ReturnType<typeof drizzle>;

  constructor() {
    const targetSchema = 'autoservice';
    const poolOptions = (host: string, port: number) => ({
      user: process.env.DB_USER || 'postgres',
      host,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port,
      options: `-c search_path=${targetSchema},public`,
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    const writeHost = process.env.DB_HOST || 'localhost';
    const writePort = parseInt(process.env.DB_PORT || '5432');

    this.writePool = new Pool(poolOptions(writeHost, writePort));
    this.db = drizzle(this.writePool, { schema });

    // Read replica — use if DB_READ_HOST is configured
    const readHost = process.env.DB_READ_HOST;
    if (readHost) {
      const readPort = parseInt(process.env.DB_READ_PORT || '5432');
      this.readPool = new Pool(poolOptions(readHost, readPort));
      this.readDb = drizzle(this.readPool, { schema });
      this.logger.log(`Read replica configured: ${readHost}:${readPort}`);
    } else {
      // Fall back to primary for read queries
      this.readPool = this.writePool;
      this.readDb = this.db;
    }
  }

  async onModuleInit() {
    try {
      await this.writePool.query('SELECT 1');
      this.logger.log(`Database connected: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);

      if (process.env.DB_READ_HOST) {
        await this.readPool.query('SELECT 1');
        this.logger.log(`Read replica connected: ${process.env.DB_READ_HOST}`);
      }
    } catch (error) {
      this.logger.error('Database connection failed', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.close();
  }

  async close() {
    await this.writePool.end();
    if (process.env.DB_READ_HOST) {
      await this.readPool.end();
    }
  }

  async getClient() {
    return this.writePool.connect();
  }

  async query(text: string, params?: any[]) {
    return this.writePool.query(text, params);
  }
}
