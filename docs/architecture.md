# TravelMind - Architecture

## Goals

- **Simple** - the smallest possible set of moving parts that supports the MVP.
- **Extensible** - swap the AI provider with one env variable. Add new modules
  next to the existing ones (auth, users, trips, ai, recommendations, admin).
- **Local-first** - everything (Postgres, API, Web) runs locally without any
  external service in Phase 1.

## High-level

```
Browser
  |
  | HTTPS / REST + JWT
  v
NestJS (apps/api)
  |
  +-- Prisma --> PostgreSQL
  |
  +-- AiProvider (mock today, OpenAI-compatible tomorrow)
```

The frontend never holds the AI key. Authentication is JWT bearer; the React app
stores the token in `localStorage` under `travelmind_token`.

## Backend layout

```
apps/api/src
├── auth/           # register, login, jwt module
├── users/          # /me, user profile
├── trips/          # user trips (with embedded itinerary generated at create time)
├── ai/             # AiService + providers (mock, openai)
├── recommendations/# public published recommendations
├── admin/          # role-gated admin endpoints
├── prisma/         # global PrismaService
├── common/
│   ├── guards/     # JwtAuthGuard, RolesGuard
│   ├── decorators/ # @Public, @Roles, @CurrentUser
│   └── filters/    # GlobalExceptionFilter
└── main.ts
```

### Cross-cutting

- `JwtAuthGuard` is registered globally via `APP_GUARD`. Endpoints opt out with
  `@Public()`.
- `RolesGuard` is also global. Endpoints declare required roles with
  `@Roles('ADMIN')`.
- `GlobalExceptionFilter` returns a consistent JSON shape and hides stack traces.
- `ValidationPipe` (`whitelist`, `transform`, `forbidNonWhitelisted`) enforces
  DTO contracts from `class-validator` decorators.

### AI provider selection

`apps/api/src/ai/ai.module.ts` exposes a token `AI_PROVIDER` and resolves it at
startup:

```ts
return provider === 'openai' && config.get('AI_API_KEY') ? openAi : mock;
```

If you later add other providers (Anthropic, Gemini, local Llama), add a new
implementation in `apps/api/src/ai/providers/`, register it in the module, and
extend the `useFactory` switch. The rest of the app stays untouched.

## Frontend layout

```
apps/web/src
├── components/        # ProtectedRoute, LoadingState, EmptyState, ErrorState, ItineraryView
├── layouts/           # MainLayout, AdminLayout
├── pages/             # Home, Login, Register, CreateTrip, MyTrips, TripDetail, Recommendations
├── admin/             # Dashboard, Users, Recommendations (admin-only routes)
├── services/          # axios instance + auth/trip/recommendation/admin clients
├── store/             # AuthContext (current user + login/logout)
├── types/             # shared TS types (mirrors backend DTOs)
├── App.tsx            # router
└── main.tsx
```

### Routing notes

- Public site uses `MainLayout` (navbar + footer).
- `/admin/*` is gated by `ProtectedRoute requireAdmin` and uses `AdminLayout`.
- Auth flows are protected by `ProtectedRoute` which redirects guests to
  `/login` and admins to `/` when accessing non-admin routes.

### API base URL

- Default: `import.meta.env.VITE_API_BASE_URL` (or `/api` as fallback).
- In Docker the web app is served by Nginx which proxies `/api/*` to the API.
- In local dev, Vite proxies `/api/*` to `http://localhost:3000`.

## Docker

- `docker-compose.yml` defines:
  - `postgres` (with health check).
  - `api` (multi-stage Dockerfile: build -> run).
  - `web` (multi-stage Dockerfile: build -> Nginx).
- Migrations are applied automatically on container start (`prisma migrate deploy`).
- The web image's Nginx proxies `/api/*` to `api:3000`.

## Future-friendly notes

- Add an `apps/web/src/hooks/` folder when you really need shared stateful logic
  (currently thin pages don't need it).
- Add a `shared/` package *only* if code needs to be reused by both apps. Today
  every shared type lives next to the frontend (`apps/web/src/types`).
- For real-time features (Phase 2+) prefer websockets only if you actually need
  bidirectional streaming; otherwise SSE is enough.
