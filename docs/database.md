# TravelMind - Database (MVP)

PostgreSQL via Prisma. Models match `apps/api/prisma/schema.prisma`.

## Tables

### `users`

| Column      | Type        | Notes                                |
| ----------- | ----------- | ------------------------------------ |
| id          | text (PK)   | cuid                                 |
| name        | text        |                                      |
| email       | text unique |                                      |
| password    | text        | bcrypt hash                          |
| role        | enum        | `USER` (default) or `ADMIN`          |
| status      | enum        | `ACTIVE` (default) or `LOCKED`       |
| createdAt   | timestamptz | default `now()`                      |
| updatedAt   | timestamptz | `@updatedAt`                         |

Relations: `trips[]`, `favorites[]`.

### `trips`

| Column      | Type        | Notes                                       |
| ----------- | ----------- | ------------------------------------------- |
| id          | text (PK)   | cuid                                        |
| userId      | text (FK)   | -> users(id), `ON DELETE CASCADE`           |
| destination | text        |                                             |
| startDate   | timestamptz |                                             |
| endDate     | timestamptz | must be >= startDate (validated in service) |
| travelers   | int         | min 1                                       |
| budget      | text        | free form (Budget / Mid-range / Premium...) |
| preferences | text        | free form                                   |
| status      | enum        | `DRAFT` / `GENERATED` / `ARCHIVED`          |
| createdAt   | timestamptz |                                             |
| updatedAt   | timestamptz |                                             |

Relations: `user`, `itineraries[]`.

Index: `userId`.

### `itineraries`

| Column      | Type        | Notes                                          |
| ----------- | ----------- | ---------------------------------------------- |
| id          | text (PK)   | cuid                                           |
| tripId      | text (FK)   | -> trips(id), `ON DELETE CASCADE`              |
| title       | text        |                                                |
| description | text        | default `""`                                   |
| content     | text        | JSON-encoded itinerary (shape in ai.types.ts)  |
| createdAt   | timestamptz |                                                |
| updatedAt   | timestamptz |                                                |

Index: `tripId`.

### `recommendations`

| Column      | Type        | Notes                              |
| ----------- | ----------- | ---------------------------------- |
| id          | text (PK)   | cuid                               |
| title       | text        |                                    |
| description | text        |                                    |
| destination | text        |                                    |
| image       | text        | image URL                          |
| content     | text        | JSON-encoded itinerary             |
| isPublished | bool        | default `false`                    |
| createdAt   | timestamptz |                                    |
| updatedAt   | timestamptz |                                    |

Index: `isPublished`.

Relations: `favorites[]`.

### `favorites`

| Column           | Type        | Notes                                          |
| ---------------- | ----------- | ---------------------------------------------- |
| id               | text (PK)   | cuid                                           |
| userId           | text (FK)   | -> users(id), `ON DELETE CASCADE`              |
| recommendationId | text (FK)   | -> recommendations(id), `ON DELETE CASCADE`    |
| createdAt        | timestamptz |                                                |

Unique: `(userId, recommendationId)`.
Index: `userId`.

## ER summary

```
users 1---* trips 1---* itineraries
users 1---* favorites *---1 recommendations
```

## Notes

- The `favorites` table exists for Phase 2. UI endpoints can be added without
  any schema change.
- Itinerary `content` is stored as text/JSON to avoid version-locking the
  generator output. Frontend parses it back to objects on read.
- We use UUID-like cuids (Prisma default) for primary keys so URLs are
  non-enumerable.
