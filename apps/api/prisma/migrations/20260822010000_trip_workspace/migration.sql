-- Travel workspace: collaboration, expenses, packing, sharing, journal,
-- booking tracking, recommendation reviews and in-app notifications.
CREATE TYPE "CollaboratorRole" AS ENUM ('VIEWER', 'EDITOR');
CREATE TYPE "BookingStatus" AS ENUM ('PLANNED', 'BOOKED', 'CANCELLED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WEATHER', 'COLLABORATION', 'BOOKING');

ALTER TABLE "trips"
  ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "shareToken" TEXT;
CREATE UNIQUE INDEX "trips_shareToken_key" ON "trips"("shareToken");

CREATE TABLE "trip_expenses" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "paidBy" TEXT NOT NULL DEFAULT '',
  "spentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trip_expenses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trip_expenses_tripId_spentAt_idx" ON "trip_expenses"("tripId", "spentAt");
ALTER TABLE "trip_expenses" ADD CONSTRAINT "trip_expenses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "packing_items" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Khác',
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "isPacked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "packing_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "packing_items_tripId_isPacked_idx" ON "packing_items"("tripId", "isPacked");
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "trip_collaborators" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trip_collaborators_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "trip_collaborators_tripId_email_key" ON "trip_collaborators"("tripId", "email");
CREATE INDEX "trip_collaborators_email_idx" ON "trip_collaborators"("email");
ALTER TABLE "trip_collaborators" ADD CONSTRAINT "trip_collaborators_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "journal_entries" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL DEFAULT '',
  "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "journal_entries_tripId_entryDate_idx" ON "journal_entries"("tripId", "entryDate");
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "bookings" (
  "id" TEXT NOT NULL,
  "tripId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "confirmation" TEXT NOT NULL DEFAULT '',
  "amount" INTEGER NOT NULL DEFAULT 0,
  "status" "BookingStatus" NOT NULL DEFAULT 'PLANNED',
  "bookedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "bookings_tripId_status_idx" ON "bookings"("tripId", "status");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "recommendation_reviews" (
  "id" TEXT NOT NULL,
  "recommendationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recommendation_reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "recommendation_reviews_recommendationId_userId_key" ON "recommendation_reviews"("recommendationId", "userId");
CREATE INDEX "recommendation_reviews_recommendationId_createdAt_idx" ON "recommendation_reviews"("recommendationId", "createdAt");
ALTER TABLE "recommendation_reviews" ADD CONSTRAINT "recommendation_reviews_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL DEFAULT 'INFO',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "link" TEXT NOT NULL DEFAULT '',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
