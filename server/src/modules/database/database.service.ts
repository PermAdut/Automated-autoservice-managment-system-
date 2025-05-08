import { Injectable } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from 'dotenv';

config();

interface QueryResultRow {
  [key: string]: unknown;
}

@Injectable()
export class DatabaseService {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USERNAME,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      const result: QueryResult<T> = await client.query<T>(sql, params);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw new Error(`Database query failed: ${(error as Error).message}`);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }
}
