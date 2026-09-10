# GoalPulse

Premium football live-score platform — **Every match. Every moment.**

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + design tokens (dark/light)
- **Prisma + SQLite** (users, favorites, notifications, cached football entities)
- **Auth.js** (email/password + optional Google OAuth)
- TanStack Query
- Sportmonks Football API v3 (with mock layer for local demo)
- Zod, Recharts, Framer Motion, Socket.IO-ready realtime

## Quick start

```bash
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`USE_MOCK_DATA=true` serves rich demo fixtures without a Sportmonks token.

Register at `/register` — favorites and notifications use SQLite via Prisma.

## Environment

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | SQLite path, e.g. `file:./dev.db` (relative to `prisma/`) |
| `AUTH_SECRET` | Auth.js secret (required) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Set `true` to show Google buttons |
| `SPORTMONKS_API_TOKEN` | **Server only** — Sportmonks API token |
| `SPORTMONKS_API_URL` | Default `https://api.sportmonks.com/v3/football` |
| `USE_MOCK_DATA` | `true` / `false` |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `CRON_SECRET` | Protects `/api/realtime/poll` |

## Database

Prisma schema: `prisma/schema.prisma`

```bash
npm run db:push      # sync schema to SQLite
npm run db:studio    # browse data
npm run db:generate  # regenerate client
```

## Scripts

```bash
npm run dev      # development
npm run build    # prisma generate + production build
npm run start    # start production server
npm run lint     # ESLint
```

## Architecture

```
Sportmonks API → football service → memory cache → API routes → React Query → UI
Prisma/SQLite  → users / favorites / notifications / sync cache
Auth.js        → sessions (JWT) + optional Google
```

- Sportmonks token never reaches the client.
- Match Center **Watch** tab shows TV stations / stream links from Sportmonks.
- Live matches refetch every ~15s via TanStack Query.

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

1. Set a strong `AUTH_SECRET` and real `DATABASE_URL` (SQLite file or migrate to Postgres later).
2. Set `SPORTMONKS_API_TOKEN`; set `USE_MOCK_DATA=false`.
3. Optionally configure Google OAuth.
4. Schedule `/api/realtime/poll` during match windows.
5. Promote admins via `ADMIN_EMAILS` or `User.role = "admin"`.
