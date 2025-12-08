-- Ensure employee name fields
ALTER TABLE "Employees"
  ADD COLUMN IF NOT EXISTS "name" varchar(100) NOT NULL DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS "surName" varchar(100) NOT NULL DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS "lastName" varchar(100);

-- Drop defaults after ensuring column existence (if they were added)
ALTER TABLE "Employees"
  ALTER COLUMN "name" DROP DEFAULT,
  ALTER COLUMN "surName" DROP DEFAULT;
