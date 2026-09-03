-- Ensure every table that the Prisma schema models with `updatedAt`
-- actually has the column in the production database.
--
-- The original `init` migration was written when several models did not
-- include `updatedAt`. The schema has since evolved and Prisma now
-- requires `updatedAt` on the matching rows. Add it where missing with
-- a sane default so existing rows still validate.
--
-- Safe to run multiple times thanks to the existence check.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packing_items' AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "packing_items"
      ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END$$;
