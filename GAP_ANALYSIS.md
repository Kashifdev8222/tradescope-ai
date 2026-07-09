# TradeScope AI — Gap Analysis & Remaining Phases

## What We've Built (Phases 1-6) vs Requirements

### CLIENT SIDE — Status

| # | Feature | Status | Gaps |
|---|---------|--------|------|
| 1 | AI Trading Dashboard | ✅ Built | None - all 6 sub-features covered |
| 2 | Web Trader Terminal | ⚠️ Partial | Missing: SMA/EMA overlays, countdown-to-close, bid/ask dotted lines, position SL/TP inline modify, limit/stop order execution (API supports but UI limited), drawing tools, order expiry |
| 3 | Live Traders | ✅ Built | None - leaderboard + activity feed working |
| 4 | Account Management | ⚠️ Partial | Missing: Multiple deposit methods UI (bank/card/crypto selector), transfer between accounts, create new account from UI |
| 5 | AI Settings | ✅ Built | None - all config options covered |

### ADMIN CONSOLE — Status

| # | Feature | Status | Gaps |
|---|---------|--------|------|
| 1 | User Management | ⚠️ Partial | Missing: New user creation from admin, user detail view with accounts/trades, per-user AI overrides UI |
| 2 | Balance Control | ✅ Built | None - AUM, adjustments, monitoring working |
| 3 | Transaction Oversight | ✅ Built | None - filters, approve/reject, CSV export |
| 4 | AI Control Panel | ⚠️ Partial | Missing: Per-user AI overrides management, active sessions list, per-session detail |
| 5 | Platform Settings | ✅ Built | None - fees, leverage, minimums configurable |

### CRITICAL MISSING MODULES (from client's 25-module live platform)

| # | Module | Priority | Effort |
|---|--------|----------|--------|
| 1 | **CRM — Clients & Leads Pipeline** | HIGH | 3 days |
| 2 | **Client Card** (profile, identity, KYC, trading summary) | HIGH | 2 days |
| 3 | **RBAC — 7 Roles + 16 Permissions Matrix** | HIGH | 2 days |
| 4 | **Agent Workspace** (3-zone daily board) | MEDIUM | 3 days |
| 5 | **KYC Document Upload & Review** | MEDIUM | 2 days |
| 6 | **Mass Data Import** (CSV/XLSX pipeline) | MEDIUM | 2 days |
| 7 | **New User Creation from Admin** | HIGH | 0.5 day |
| 8 | **Per-User AI Overrides UI** | HIGH | 0.5 day |
| 9 | **Reports** (funnel + KPIs) | LOW | 1 day |
| 10 | **Transfer Between Accounts** | LOW | 0.5 day |
| 11 | **Chart Enhancements** (SMA/EMA, bid/ask lines) | LOW | 1 day |
| 12 | **Web Calls (LiveKit)** | FUTURE | External |
| 13 | **PSTN/SMS/WhatsApp** | FUTURE | External |

---

## Recommended Next Phases

### Phase 7: Admin Enhancements (1.5 days)
- New user creation from admin panel
- Per-user AI overrides UI in AI Control Panel
- User detail view (accounts, trades, AI status per user)
- Transfer between accounts

### Phase 8: RBAC + Permissions (2 days)
- 7 roles: owner, admin, account_manager, retention_manager, conversion_manager, it_manager, agent
- 16 permission slugs with matrix
- Role management UI in admin
- Permission checks on all admin endpoints
- Audit logging for all admin actions

### Phase 9: CRM — Clients & Leads (3 days)
- Client/lead pipeline with CRUD operations
- Duplicate detection (identity → phone → email)
- Lead vs client status, deposit roll-ups
- Per-client flags (do-not-call, high-risk, complaint)
- Notes, consent timestamps
- In-place client expansion on list
- Client search and filtering

### Phase 10: Client Card (2 days)
- Full client profile with collapsible sections
- Facts row (created, FTD date, last visit, timezone)
- Qualification profile (age, occupation, experience, savings)
- Live trading account summary
- KYC documents section
- Transaction history per client
- Calls, tasks, and phones directory
- Communication channel buttons

### Phase 11: KYC + Agent Workspace (3 days)
- Document upload (jpeg/png/pdf, ≤10MB) to Supabase Storage
- Admin review with signed URLs
- Approve/reject per document
- Stated vs verified identity fields
- Agent Workspace: 3-zone board
  - Zone 1: Prioritized client lists
  - Zone 2: Meetings/callbacks agenda
  - Zone 3: WhatsApp/SMS inbox

### Phase 12: Mass Data Import + Reports (2 days)
- CSV/XLSX upload pipeline
- Column auto-mapping
- Validation with dedup preview
- Chunked idempotent commit
- Full rollback capability
- Reports: funnel + KPIs

### Phase 13: Chart & Order Enhancements (1 day)
- SMA-20/EMA-50 overlays on chart
- Bid/ask spread lines on chart
- Countdown-to-bar-close chip
- Position SL/TP inline modify from positions panel
- Order expiry (GTC/IOC/FOK)

### Phase 14: Security Hardening (2 days)
- RLS policy review and tightening
- Rate limiting on auth endpoints
- CORS narrowing
- Secret rotation
- Input sanitization pass

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Complete | 10 of 25 modules |
| ⚠️ Partial | 5 modules |
| ❌ Not Started | 10 modules |
| 🔮 Future (external) | 4 modules |

**Core platform is ~60% complete.** The remaining work focuses on CRM, RBAC, and admin operations — the broker back-office features the client already has live.
