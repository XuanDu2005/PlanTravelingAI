# TravelMind

> AI-powered travel itinerary planner. **Phase 1 / MVP.**

TravelMind helps travelers turn destination + dates + preferences into a clean
day-by-day itinerary. Admins curate sample itineraries and manage users.

---

## Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS + React Router + Axios
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL + JWT + bcrypt
- **AI**: Pluggable `AiProvider` (ships with `MockAiProvider`, ready for OpenAI)
- **Infra**: Docker + Docker Compose, pnpm workspaces

---

## Project layout

```
TravelMind/
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── src/             # Modules: auth, users, trips, ai, recommendations, admin
│   │   ├── prisma/          # schema.prisma + seed.ts
│   │   └── package.json
│   └── web/                 # React frontend (Vite)
│       └── src/
│           ├── components/
│           ├── layouts/      # MainLayout, AdminLayout
│           ├── pages/        # Home, Login, Register, CreateTrip, MyTrips, TripDetail, Recommendations
│           ├── admin/        # Dashboard, Users, Recommendations
│           ├── services/     # axios clients
│           ├── store/        # AuthContext
│           ├── types/        # shared TS types
│           ├── App.tsx
│           └── main.tsx
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── docker-compose.yml
│   └── nginx.conf
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   └── database.md
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Local development (without Docker)

Prerequisites: **Node 20+**, **pnpm 9+**, **PostgreSQL 16+** running locally.

```bash
# 1. Install dependencies
cd TravelMind
pnpm install

# 2. Configure env
cp .env.example .env
# Edit DATABASE_URL etc.

# 3. Generate Prisma client + apply migrations + seed
pnpm prisma:migrate --name init
pnpm prisma:seed

# 4. Run the API (port 3000)
pnpm dev:api

# 5. Run the web app (port 5173)
pnpm dev:web
```

Open:

- Web: <http://localhost:5173>
- API: <http://localhost:3000/api/health>

**Seed accounts (after `pnpm prisma:seed`):**

| Role  | Email                       | Password    |
| ----- | --------------------------- | ----------- |
| Admin | admin@travelmind.local      | Admin@123456 |
| User  | user@travelmind.local       | User@123456  |

---

## Docker

The whole stack (Postgres, API, Web) runs with one command:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Open:

- Web: <http://localhost:5173>
- API: <http://localhost:3000/api/health>

To tear down:

```bash
docker compose -f docker/docker-compose.yml down -v
```

---

## Phase 1 checklist

- [x] Monorepo pnpm with `apps/api` & `apps/web`
- [x] NestJS backend with: auth, users, trips, ai, recommendations, admin
- [x] Prisma schema + Postgres + seed (admin + demo recommendations)
- [x] React frontend with all MVP pages (Home, Auth, Trip flow, Recommendations)
- [x] Admin section (Dashboard, Users, Recommendations CRUD + Publish/Unpublish)
- [x] JWT auth + role-based guard for `/admin/*`
- [x] Mock AI provider with structured day-by-day output (ready for swap)
- [x] Docker Compose for Postgres + API + Web (single command up)

### Currently mocked

- AI responses come from `MockAiProvider` (deterministic per input). To use a real model:
  - **Gemini** (default, recommended): set `AI_PROVIDER=gemini` and `AI_API_KEY=...` in `.env`. Get a free key at https://aistudio.google.com/apikey. Default model is `gemini-2.5-flash`.
  - **OpenAI**: set `AI_PROVIDER=openai` and `AI_API_KEY=sk-...`. The `OpenAiProvider` class is still stubbed (mock response) — wire a real network call before relying on it.
  - **Mock**: set `AI_PROVIDER=mock` to always use the bundled deterministic provider.
- If `AI_PROVIDER=gemini` is selected but `AI_API_KEY` is empty, the backend logs a warning and falls back to the mock provider so the app keeps running.

### Deliberately out of scope (Phase 2+)

- Payments, Email, Maps, Weather, Google Places
- WebSockets / SSE / Notifications
- Recommendation favorites (model exists, endpoints not exposed in UI yet)
- User lock/unlock action (read-only on `/admin/users` for now)
- File upload for images (paste an image URL in admin form)

See `docs/requirements.md` for the original brief and `docs/architecture.md`
for the design choices.
