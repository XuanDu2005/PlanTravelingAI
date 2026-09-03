-- Migration: sync table names with Prisma schema
-- The trip_workspace migration created `trip_expenses` but the Prisma
-- model `Expense` is mapped to `expenses`. Rename to keep client + DB aligned.
-- Other tables (`packing_items`, `notifications`, `recommendation_reviews`,
-- `bookings`, `journal_entries`, `trip_collaborators`) are referenced via
-- their Prisma model names without `@@map`, so the names already match.

ALTER TABLE "trip_expenses" RENAME TO "expenses";

-- Also add the missing `updatedAt` column on `expenses` (Prisma schema requires it).
ALTER TABLE "expenses"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to `users` (avatar + language referenced by User model).
ALTER TABLE "users"
  ADD COLUMN "language" TEXT NOT NULL DEFAULT 'vi',
  ADD COLUMN "avatar"   TEXT NOT NULL DEFAULT '';
