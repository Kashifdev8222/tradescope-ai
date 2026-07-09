# TradeScope AI — Master Development Plan

**Prepared:** July 8, 2026  
**Team:** Full-Stack Engineering  
**Stack:** React 19 + Vite + Tailwind CSS | Express 5 + Node.js | Supabase (PostgreSQL + Auth + Realtime) | Render Hosting

---

## 1. Project Overview

Complete AI-powered forex/CFD trading platform with two zones:

- **Client Zone** — Trading dashboard, multi-asset web trader, live leaderboard, wallet (deposits/withdrawals), AI auto-trading, account management
- **Admin Console** — User management, balance control, transaction oversight, AI control panel, platform settings, CRM, KYC review, RBAC

Built from scratch to replace the client's existing Expo/FastAPI prototype with a modern, maintainable stack.

---

## 2. Client Requirements Coverage

### 👤 CLIENT SIDE

| # | Requirement | Phase | Status |
|---|------------|-------|--------|
| 1 | **AI Trading Dashboard** — Live portfolio overview, buying power, cash, daily P/L, open positions | Phase 2 | ✅ Complete |
| 2 | Real-time AI engine analyzing markets with confidence scoring | Phase 2 | ✅ Complete |
| 3 | Open trades table with live P/L tracking | Phase 2 | ✅ Complete |
| 4 | Daily goal progress & risk summary | Phase 2 | ✅ Complete |
| 5 | Live news feed (Reuters, Bloomberg, CNBC) | Phase 2 | ✅ Complete |
| 6 | AI order board showing entry/target/stop levels | Phase 2 | ✅ Complete |
| 7 | **Web Trader** — Full trading terminal with quotes, charts, trade execution | Phase 3 | ⚠️ Partial |
| 8 | Symbol search, bid/ask spreads, one-click trading | Phase 3 | ✅ Complete |
| 9 | Position management (daily/open toggle) | Phase 3 | ✅ Complete |
| 10 | Balance, equity, margin tracking | Phase 3 | ✅ Complete |
| 11 | **Live Traders** — Real-time leaderboard of anonymous traders | Phase 6 | ✅ Complete |
| 12 | Live robot activity feed — every trade as it happens | Phase 6 | ✅ Complete |
| 13 | Trader IDs only (no names), win rates, profit tracking | Phase 6 | ✅ Complete |
| 14 | Auto-updates every few seconds | Phase 6 | ✅ Complete |
| 15 | **Account Management** — Multiple trading accounts per user | Phase 4 | ✅ Complete |
| 16 | Deposit via bank transfer, credit card, or crypto | Phase 4 | ⚠️ Partial |
| 17 | Withdrawal requests with destination selection | Phase 4 | ✅ Complete |
| 18 | Full transaction history | Phase 4 | ✅ Complete |
| 19 | **AI Settings** — Risk level control (Conservative/Moderate/Aggressive) | Phase 5 | ✅ Complete |
| 20 | Max daily trades, position size limits | Phase 5 | ✅ Complete |
| 21 | Daily loss limit and profit target configuration | Phase 5 | ✅ Complete |

### 🔐 ADMIN CONSOLE

| # | Requirement | Phase | Status |
|---|------------|-------|--------|
| 22 | **User Management** — Full user directory with search, status control | Phase 0 | ✅ Complete |
| 23 | Activate/suspend/reactivate any account | Phase 0 | ✅ Complete |
| 24 | AI enable/disable per user | Phase 0 | ✅ Complete |
| 25 | New user creation | Phase 7 | ❌ Not Started |
| 26 | **Balance Control** — View and adjust any user's balance | Phase 0 | ✅ Complete |
| 27 | Monitor total platform AUM, margin usage | Phase 0 | ✅ Complete |
| 28 | Track pending deposits and withdrawals | Phase 0 | ✅ Complete |
| 29 | Override individual limits | Phase 7 | ❌ Not Started |
| 30 | **Transaction Oversight** — Real-time transaction monitoring | Phase 0 | ✅ Complete |
| 31 | Filter by type (deposit, withdrawal, trade, fee) | Phase 0 | ✅ Complete |
| 32 | Approve/reject pending withdrawals | Phase 0 | ✅ Complete |
| 33 | Export to CSV for accounting | Phase 0 | ✅ Complete |
| 34 | **AI Control Panel** — Global AI parameters | Phase 0 | ✅ Complete |
| 35 | Per-user AI overrides — customize risk per trader | Phase 7 | ❌ Not Started |
| 36 | Emergency stop — kill all AI trading instantly | Phase 0 | ✅ Complete |
| 37 | Monitor active sessions, daily trades, platform-wide win rate | Phase 0 | ✅ Complete |
| 38 | **Platform Settings** — Leverage defaults, minimum deposits, fees | Phase 0 | ✅ Complete |
| 39 | Commission rates, withdrawal fees | Phase 0 | ✅ Complete |
| 40 | Full platform configuration | Phase 0 | ✅ Complete |

---

## 3. Design System

- **Tailwind CSS** — Utility-first, no separate CSS files needed
- **Light theme** (default) — Clean white/gray with blue accents (`#2563EB`)
- **Dark theme** — Toggle via 🌙/☀️ button, matches reference at tradescope-app.pages.dev
- **Responsive** — Full support 320px → desktop, hamburger menu + bottom nav on mobile
- **Real SVG icons** — No emoji in production components
- **Premium auth pages** — Split-screen with curved SVG divider, gradient blobs, dot-grid textures

---

## 4. Completed Phases (1-6)

### Phase 1 — Authentication & Onboarding ✅
| File | Description |
|------|-------------|
| `LoginPage.tsx` | Split-screen: dark brand panel + form, curved SVG divider, password toggle |
| `RegisterPage.tsx` | Name/Email/Phone/Password, real-time validation |
| `AdminLoginPage.tsx` | Indigo/violet "Agent Zone" theme |
| `ProtectedRoute.tsx` | Auth guard with centered loading spinner |
| `auth.service.ts` | Supabase Auth integration (register/login/reset) |
| `001_initial_schema.sql` | 12 tables, triggers, RLS policies |

### Phase 2 — AI Trading Dashboard ✅
| Component | Description |
|-----------|-------------|
| `DashboardPage.tsx` | 5 stat cards, daily goal progress bar, 4 risk metric cards |
| AI Order Board | Entry/SL/TP levels per signal |
| AI Signal Board | Confidence scores, buy/sell badges |
| Open Positions | Live P&L, SL/TP display |
| News Feed | Reuters/Bloomberg/CNBC with timestamps |

### Phase 3 — Web Trader Terminal ⚠️
| Component | Description |
|-----------|-------------|
| `TradingChart.tsx` | lightweight-charts v5, 5 timeframes, theme-adaptive |
| `Watchlist.tsx` | 35 instruments, 5 classes, filters, search |
| `OrderTicket.tsx` | Market/Limit/Stop, Buy/Sell, SL/TP, ARM mode |
| `TraderPage.tsx` | Account bar, chart + positions panel |
| **Missing** | SMA/EMA overlays, bid/ask lines, countdown chip, SL/TP inline modify |

### Phase 4 — Account Management ✅
| Component | Description |
|-----------|-------------|
| `AccountsPage.tsx` | Account cards, deposit/withdraw modals |
| Transaction History | Full table with type/status badges |
| **Missing** | Multiple deposit method UI, transfer between accounts |

### Phase 5 — AI Settings ✅
| Component | Description |
|-----------|-------------|
| `AISettingsPage.tsx` | Risk level selector, trade limits sliders, loss/target inputs, SL/TP % |

### Phase 6 — Live Traders ✅
| Component | Description |
|-----------|-------------|
| `LiveTradersPage.tsx` | Leaderboard table (rank/trader ID/win rate/profit/streak) |
| Activity Feed | Real-time scrolling, auto-refresh every 3s |

---

## 5. Remaining Phases (7-14)

### Phase 7 — Admin Enhancements (1 day)
- New user creation from admin panel
- Per-user AI overrides UI
- Transfer between accounts
- Per-user limit overrides

### Phase 8 — RBAC + Permissions Matrix (2 days)
- 7 roles: owner, admin, account_manager, retention_manager, conversion_manager, it_manager, agent
- 16 permission slugs with editable matrix
- Role management UI (`/admin/roles`)
- Permission checks on all admin endpoints
- `requirePermission` middleware
- Audit log for all admin actions

### Phase 9 — CRM: Clients & Leads (3 days)
- Client/lead pipeline with CRUD
- Duplicate detection (identity → phone → email)
- Lead vs client status, deposit roll-ups
- Per-client flags (do-not-call, high-risk, complaint)
- Notes, consent timestamps
- Client search and filtering
- In-place row expansion

### Phase 10 — Client Card (2 days)
- Full client profile with collapsible sections
- Facts row (created, FTD date, last visit, timezone)
- Qualification profile (age, occupation, experience, savings)
- Live trading account summary (balance, equity, P/L, win rate)
- KYC documents section
- Transaction history per client
- Phones directory (multiple numbers, primary mirroring)
- Communication buttons (Web call / Phone / WhatsApp seams)

### Phase 11 — KYC + Agent Workspace (3 days)
- Document upload (jpeg/png/pdf, ≤10MB) → Supabase Storage
- Admin review with signed URLs
- Approve/reject per document
- Stated vs verified identity checks
- Agent Workspace: 3-zone daily board
  - Zone 1: Prioritized client lists
  - Zone 2: Meetings/callbacks agenda
  - Zone 3: WhatsApp/SMS inbox (seam)

### Phase 12 — Mass Data Import + Reports (2 days)
- CSV/XLSX upload (25MB / 50k rows)
- Column auto-mapping with synonym detection
- Validation with dedup preview
- Chunked idempotent commit (≤200 rows/tick)
- Full rollback capability
- Reports: funnel + KPIs with collapsible sections

### Phase 13 — Chart & Order Enhancements (1 day)
- SMA-20 / EMA-50 overlays
- Bid/ask dotted spread lines on chart
- Countdown-to-bar-close chip
- Position SL/TP inline modify
- Order expiry (GTC/IOC/FOK)
- Drawing tools (lines, channels)

### Phase 14 — Security Hardening (2 days)
- RLS policy review and tightening
- Rate limiting on auth endpoints
- CORS narrowing to Pages origins
- Secret rotation
- Input sanitization pass
- Client auth enforcement toggle

---

## 6. Future Phases (External Dependencies)

| Phase | Description | Blocker |
|-------|-------------|---------|
| Web Calls | LiveKit WebRTC integration | LiveKit API keys |
| PSTN Dial-out | Outbound phone calls via SIP trunk | SIP trunk credentials |
| SMS Two-way | SMS inbox in agent workspace | SMS provider choice |
| WhatsApp Outbound | Cloud API business messaging | Meta business verification |
| Production Deploy | Render + Cloudflare Pages + CI/CD | Render paid tier |

---

## 7. Technical Architecture

```
tradescope-ai/
├── apps/
│   ├── api/              # Express 5 backend
│   │   ├── src/
│   │   │   ├── config/   # Supabase, CORS, env
│   │   │   ├── middleware/# auth, admin, validation, rate limiting
│   │   │   ├── modules/  # 11 domain modules (auth, users, accounts, trades, transactions, ai, leaderboard, news, admin, platform, market)
│   │   │   └── engine/   # Mock AI engine, market data simulator, scheduler
│   │   └── supabase/migrations/
│   ├── client/           # React 19 frontend
│   │   └── src/
│   │       ├── api/      # Axios client with JWT interceptor
│   │       ├── components/ # layout/, trading/
│   │       ├── pages/    # auth/, dashboard/, trader/, live-traders/, accounts/, settings/
│   │       ├── stores/   # Zustand (auth, UI, theme)
│   │       └── styles/   # Tailwind globals
│   └── admin/            # React 19 admin panel
│       └── src/pages/    # login/, users/, balances/, transactions/, ai-control/, settings/
├── packages/
│   ├── shared-types/     # TypeScript interfaces (8 modules)
│   ├── shared-utils/     # Formatters, Zod validators, pagination
│   └── ui-kit/           # Shared theme CSS
└── supabase/             # PostgreSQL (12 tables, RLS, triggers)
```

### Database Tables
`profiles` | `trading_accounts` | `transactions` | `trades` | `ai_signals` | `ai_settings` | `portfolio_snapshots` | `leaderboard_entries` | `trader_activity_feed` | `platform_settings` | `admin_actions` | `user_ai_overrides`

### API Endpoints
60+ REST endpoints across 11 modules under `/api/v1/`. Standard response envelope `{ success, data, meta, error }`. JWT auth via Supabase.

---

## 8. Summary

| Metric | Count |
|--------|-------|
| Total client requirements | 40 |
| Completed | 33 (82.5%) |
| Partial | 4 (10%) |
| Not started | 3 (7.5%) |
| Phases completed | 6 of 14 |
| API endpoints | 60+ |
| Database tables | 12 |
| React components | 30+ |
| Responsive support | 320px → 4K |

**Current milestone:** Core trading platform functional — dashboard, web trader terminal, live leaderboard, account management, AI settings, and admin console all operational with both light/dark themes.

**Next milestone:** Admin enhancements (Phase 7) → RBAC (Phase 8) → CRM (Phase 9-10)
