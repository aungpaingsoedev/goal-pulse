# GoalPulse

Premium football live-score platform — **Every match. Every moment.**

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + design tokens (dark/light)
- Supabase (Auth, Postgres, RLS)
- TanStack Query
- API-Football (with mock layer for local demo)
- Zod, Recharts, Framer Motion, Socket.IO-ready realtime

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`USE_MOCK_DATA=true` (default in `.env.local`) serves rich demo fixtures without an API key.

## Environment

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never expose |
| `FOOTBALL_API_KEY` | **Server only** — API-Football key |
| `FOOTBALL_API_URL` | Default `https://v3.football.api-sports.io` |
| `USE_MOCK_DATA` | `true` / `false` |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `CRON_SECRET` | Protects `/api/realtime/poll` |

## Supabase setup

1. Create a Supabase project.
2. Run SQL migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_unified_favorites.sql`
3. Enable Email + Google Auth providers.
4. Add redirect URL: `http://localhost:3000/auth/callback` (add callback route if needed).

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # start production server
npm run lint     # ESLint
```

## Architecture

```
API-Football → football service → memory cache → API routes → React Query → UI
                                      ↓
                                 sync service → Socket.IO events
```

- Football API key never reaches the client.
- Live matches refetch every ~15s via TanStack Query.
- `/api/realtime/poll` detects score/status/event diffs and emits websocket events.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Dashboard |
| `/live` | Live scores |
| `/matches`, `/matches/[id]` | Fixtures + Match Center |
| `/leagues`, `/teams`, `/players`, `/standings` | Browse |
| `/favorites`, `/search`, `/settings` | Personalization |
| `/login`, `/register` | Auth |
| `/admin` | Admin + sync |

## Production checklist

1. Set real Supabase + API-Football keys; set `USE_MOCK_DATA=false`.
2. Apply migrations and RLS.
3. Configure Google OAuth.
4. Schedule `/api/realtime/poll` every 15–30s during match windows.
5. Promote admins via `profiles.role = 'admin'` or `ADMIN_EMAILS`.
