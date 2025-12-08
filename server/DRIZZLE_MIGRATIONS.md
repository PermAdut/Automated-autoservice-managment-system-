# Drizzle Migrations Guide

This project uses Drizzle ORM for database migrations. Follow this guide to manage your database schema.

## Setup

1. Make sure your `.env` file has the correct database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=autoservice
   ```

## Available Commands

### Generate Migrations
After making changes to the schema in `src/drizzle/schema.ts`:

```bash
npm run db:generate
```

This will:
- Analyze your schema changes
- Generate migration files in the `drizzle/migrations` folder
- Create SQL migration files that can be reviewed before applying

### Run Migrations
Apply pending migrations to your database:

```bash
npm run db:migrate
```

This will:
- Connect to your database
- Run all pending migrations in order
- Update the migration tracking table

### Push Schema Directly (Development Only)
For rapid development, you can push schema changes directly without generating migration files:

```bash
npm run db:push
```

**Warning:** This bypasses migration files and directly modifies the database. Use only in development.

### Open Drizzle Studio
View and edit your database through a visual interface:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:4983` where you can:
- Browse tables and data
- Run queries
- Edit records

### Drop All Tables (Use with Caution!)
Remove all tables from the database:

```bash
npm run db:drop
```

**Warning:** This will delete all data! Use only when you need to completely reset the database.

## Migration Workflow

### Initial Setup
1. Create your database schema in `src/drizzle/schema.ts`
2. Run `npm run db:generate` to create the initial migration
3. Review the generated SQL files in the `drizzle` folder
4. Run `npm run db:migrate` to apply migrations

### Making Schema Changes
1. Update the schema in `src/drizzle/schema.ts`
2. Run `npm run db:generate` to create a new migration
3. Review the generated migration files
4. Run `npm run db:migrate` to apply the changes

### Example Workflow

```bash
# 1. Make changes to src/drizzle/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Review generated files in drizzle/migrations folder
# 4. Apply migrations
npm run db:migrate

# 5. (Optional) Seed the database
npm run db:seed
```

## Migration Files Location

All migration files are stored in the `drizzle/migrations/` folder at the root of the server directory. This folder contains:
- SQL migration files (`.sql`)
- Migration metadata (`.json`)

## Running Migrations Programmatically

You can also run migrations from your application code:

```typescript
import { runMigrations } from './modules/database/migrations/migrate';

await runMigrations();
```

Or use the `MigrationsService` in your NestJS application (currently disabled by default in `onModuleInit`).

## Troubleshooting

### Migration conflicts
If you encounter conflicts, you may need to:
1. Review the migration files
2. Manually resolve conflicts
3. Regenerate migrations if needed

### Database connection issues
Make sure your `.env` file has the correct database credentials and the database server is running.

### Schema drift
If your database schema doesn't match your code, you can:
1. Use `db:push` to sync (development only)
2. Or generate a new migration to align them

## Best Practices

1. **Always review generated migrations** before applying them
2. **Commit migration files** to version control
3. **Never edit applied migrations** - create new ones instead
4. **Use migrations in production** - don't use `db:push` in production
5. **Test migrations** on a development database first
6. **Backup your database** before running migrations in production

