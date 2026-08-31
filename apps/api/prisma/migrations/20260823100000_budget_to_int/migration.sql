-- Convert existing Trip.budget values from formatted VND strings ("5.000.000 ₫")
-- into raw integers (5000000). Anything that can't be parsed falls back to 0.
UPDATE "trips"
SET "budget" = COALESCE(
  NULLIF(regexp_replace("budget", '[^0-9]', '', 'g'), '')::int,
  0
);

-- Now safe to alter the column type. Use a USIng expression that handles every
-- leftover case (NULL, non-digit strings) by coercing to 0.
ALTER TABLE "trips"
  ALTER COLUMN "budget" TYPE int USING (
    COALESCE(NULLIF(regexp_replace("budget"::text, '[^0-9]', '', 'g'), ''), '0')::int
  );