import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as path from 'path';

@Injectable()
export class MigrationsService implements OnModuleInit {
  private readonly logger = new Logger(MigrationsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    // Uncomment the line below to run migrations automatically on app startup
    // await this.runMigrations();
  }

  async runMigrations() {
    try {
      this.logger.log('Running database migrations...');

      const migrationsFolder = path.resolve(
        process.cwd(),
        'drizzle/migrations'
      );

      await migrate(this.databaseService.db, {
        migrationsFolder,
      });

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Database migration failed:', error);
      throw error;
    }
  }
}
