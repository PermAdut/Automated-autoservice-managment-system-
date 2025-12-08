# Database Migrations

This directory contains database migration scripts for Drizzle ORM.

## Available Commands

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema changes directly to database (development only)
- `npm run db:studio` - Open Drizzle Studio to view database
- `npm run db:drop` - Drop all tables (use with caution!)

## Migration Workflow

1. Make changes to the schema in `src/drizzle/schema.ts` (models under `src/drizzle/models`)
2. Run `npm run db:generate` to generate migration files
3. Review the generated migration files in the `drizzle/migrations` folder
4. Run `npm run db:migrate` to apply migrations to the database

## Running Migrations Programmatically

You can also run migrations programmatically using the `migrate.ts` script:

```typescript
import { runMigrations } from './migrations/migrate';
await runMigrations();
```

