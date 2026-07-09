# TradeScope AI — Full-Stack Trading Platform

AI-powered trading platform with client dashboard and admin console.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: Node.js + Express 5
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Frontend**: React 19 + Vite + Tailwind CSS
- **State**: TanStack Query + Zustand
- **Hosting**: Render

## Project Structure

```
tradescope-ai/
├── packages/
│   ├── shared-types/       # TypeScript interfaces
│   ├── shared-utils/       # Formatting, validation, pagination
│   └── ui-kit/             # Shared React components
├── apps/
│   ├── api/                # Express.js backend
│   ├── client/             # User-facing trading dashboard
│   └── admin/              # Admin console
└── render.yaml             # Render deployment blueprint
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase project

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env with your Supabase credentials

# Run database migrations
# Copy apps/api/supabase/migrations/001_initial_schema.sql
# and run it in your Supabase SQL Editor

# Start development
pnpm dev:api      # API on port 10000
pnpm dev:client   # Client on port 5173
pnpm dev:admin    # Admin on port 5174
```

### Environment Variables

**API (`apps/api/.env`)**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `SUPABASE_ANON_KEY` - Supabase anon key
- `PORT` - Server port (default: 10000)

**Client (`apps/client/.env`)**
- `VITE_API_URL` - API base URL
- `VITE_SUPABASE_URL` - Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

**Admin (`apps/admin/.env`)**
- `VITE_API_URL` - API base URL
- `VITE_SUPABASE_URL` - Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

## Features

### Client App
- AI Trading Dashboard with real-time portfolio overview
- Web Trader terminal with trade execution
- Live anonymous trader leaderboard
- Multi-account management with deposits/withdrawals
- AI settings configuration (risk levels, trade limits)

### Admin Console
- User management (activate/suspend, AI toggle)
- Platform balance monitoring (AUM, margin)
- Transaction oversight (approve/reject withdrawals, CSV export)
- AI control panel (global params, emergency stop)
- Platform settings (fees, leverage, minimums)

## Deployment

Deploy to Render using the `render.yaml` blueprint or manually:

1. Create a Render Web Service for `apps/api`
2. Create a Render Static Site for `apps/client`
3. Create a Render Static Site for `apps/admin`

All three share the same Supabase project.
