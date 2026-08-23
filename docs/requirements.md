# TravelMind - Requirements

## 1. Goal

TravelMind is a website that helps users create travel itineraries with AI.

### Users

- Register / log in.
- Enter trip details.
- Ask AI to generate an itinerary.
- View the generated itinerary.
- View admin-published sample itineraries.
- View a sample itinerary in detail.

### Admin

- Log in with an admin account.
- View a dashboard.
- Manage users.
- Manage sample itineraries (CRUD + publish/unpublish).

## 2. Tech

| Layer    | Choice                                                    |
| -------- | --------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, TailwindCSS, React Router, Axios |
| Backend  | NestJS, TypeScript, Prisma, PostgreSQL, JWT, bcrypt       |
| AI       | AI service calls via backend. API key stays on backend.   |
| Infra    | Docker, Docker Compose                                    |
| Manager  | pnpm workspaces                                           |

## 3. Architecture (MVP)

```
React frontend  --HTTP/REST-->  NestJS backend
                                    |
                                    +-- Prisma --> PostgreSQL
                                    |
                                    +-- AI Provider (mock today, pluggable)
```

- No microservices.
- No Redis / Kafka / RabbitMQ / Event Bus / Outbox.
- No shared package until a second consumer needs it.

## 4. Folder structure

See `README.md`.

## 5. Database (MVP)

Tables: `User`, `Trip`, `Itinerary`, `Recommendation`, `Favorite`.

Relations:

```
User 1---* Trip 1---* Itinerary
User 1---* Favorite *---1 Recommendation
```

## 6. Frontend pages

Public:

- `/` Home
- `/login`, `/register`
- `/recommendations`, `/recommendations/:id`

Authenticated:

- `/create-trip`, `/trips`, `/trips/:id`

Admin:

- `/admin/dashboard`
- `/admin/users`
- `/admin/recommendations`, `/admin/recommendations/new`,
  `/admin/recommendations/:id/edit`

## 7. API (MVP)

| Method | Path                                   | Auth   |
| ------ | -------------------------------------- | ------ |
| POST   | /api/auth/register                     | Public |
| POST   | /api/auth/login                        | Public |
| GET    | /api/users/me                          | User   |
| POST   | /api/trips                             | User   |
| GET    | /api/trips                             | User   |
| GET    | /api/trips/:id                         | User   |
| DELETE | /api/trips/:id                         | User   |
| POST   | /api/ai/generate                       | User   |
| GET    | /api/recommendations                   | Public |
| GET    | /api/recommendations/:id               | Public |
| GET    | /api/admin/dashboard                   | Admin  |
| GET    | /api/admin/users                       | Admin  |
| GET    | /api/admin/recommendations             | Admin  |
| POST   | /api/admin/recommendations             | Admin  |
| PATCH  | /api/admin/recommendations/:id         | Admin  |
| PATCH  | /api/admin/recommendations/:id/publish | Admin  |
| DELETE | /api/admin/recommendations/:id         | Admin  |

## 8. AI service

`AiService.generateItinerary(input)` returns:

```ts
{
  title: string;
  summary: string;
  days: Array<{
    day: number;
    date: string;
    activities: Array<{
      time: string;
      title: string;
      description: string;
      location: string;
    }>;
  }>;
}
```

Strategy:

- `AI_PROVIDER=mock` (default) -> `MockAiProvider` produces deterministic
  itineraries so the UI can render without an API key.
- `AI_PROVIDER=openai` -> `OpenAiProvider` (stubbed in Phase 1, ready to wire).

## 9. Phase 1 - What ships

- Monorepo (pnpm) with apps/api and apps/web.
- Auth (register, login, /me) + JWT + bcrypt + Role guard.
- Trip CRUD with mock AI itinerary generation.
- Public recommendations list + detail.
- Admin dashboard, user list, recommendation CRUD + publish/unpublish.
- React UI for every flow above, ready to view with seed data.
- Docker Compose for postgres + api + web.

## 10. Out of scope (Phase 2+)

- Payments, Stripe.
- Redis / caching layers.
- WebSockets / SSE / email / SMS notifications.
- Google Places / Maps / Weather APIs.
- Social login.
- Advanced analytics.
- Microservices, Kubernetes, CI/CD.
