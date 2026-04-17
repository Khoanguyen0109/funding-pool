# FundPool — Smart Money Pool Management

**Date:** 2026-04-12
**Status:** Approved
**Author:** AI-assisted brainstorm

---

## Product Vision

FundPool is a web app where users create money pools — shared or private budget containers with defined categories. A pool can be anything: a household fund, a trip budget, a club treasury, or personal savings. Members contribute flexibly and spend against category budgets, with optional rule-based permissions for oversight.

**Core differentiator:** Pool-as-first-class-entity that works for both personal and group use, solving the gap between personal finance apps (YNAB, Mint) and group splitting apps (Splitwise, Pool/Braid).

## Target Users

Consumer / friends & family. Casual tone, zero-friction onboarding, mobile-responsive web app first, native mobile later.

## Competitor Landscape

### Expense Splitting (Splitwise, Are We Even, GroupSplit, Divvy)

- Focus on splitting past expenses, not managing shared funds
- No budget tracking or category budgets
- Splitwise: confusing group vs individual separation, no budgeting, calculation bugs
- Are We Even: browser-based low friction, but splitting only

### Shared Fund / Pool (Braid/Pool, Splyt)

- Braid/Pool: actual money pooling, but being sunset/rebuilt, no budgeting
- Splyt: group management with recurring splits, but mobile-only, no budget tracking

### Collaborative Budgeting (DuoSpend, GoodShare, Koody, CoFinance)

- Couples/household focused, limited group sizes
- DuoSpend: up to 6 members, bank import, privacy controls
- Koody: role-based permissions (owner/editor/viewer) but couples-only
- GoodShare: unlimited members, invite codes, but no role-based permissions

### Market Gap

No single product combines: shared money pool + category budgets + flexible contributions + role-based permissions + configurable approval rules. FundPool fills this gap.

## Core Concepts

### Money Pool

The central entity. Every financial activity happens inside a pool.

- A user can create many pools
- A pool is **private** (personal) or **shared** (with other members)
- A pool has **categories** with individual budgets
- A pool has a **real balance**: members contribute money in, expenses draw money out
- Contributions are **flexible**: members contribute any amount, any time, no fixed obligation

### Permissions

Roles: owner, admin, member, viewer.

| Role | View | Add expense | Contribute | Manage categories | Manage members | Pool settings |
|------|------|-------------|-----------|-------------------|----------------|---------------|
| Owner | Yes | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes (except owner) | No |
| Member | Yes | Yes (subject to rules) | Yes | No | No | No |
| Viewer | Yes | No | No | No | No | No |

### Configurable Rules

Per-pool settings:

- `require_approval`: off by default. When on, expenses above `approval_threshold` require admin/owner approval before affecting the pool balance.

Per-member rules:

- `max_spend_without_approval`: amount threshold (only relevant if pool approval is on)
- `can_invite`: whether this member can generate invite links
- `can_edit_categories`: whether this member can add/edit/delete categories

### Over-Budget Behavior

When an expense exceeds a category's remaining budget: **warn but allow**. The category shows negative/over-budget visually (red), but the expense is not blocked.

## Data Model

### User

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | string | Display name |
| email | string | Unique, from OAuth |
| avatar | string | URL, from OAuth |
| oauth_provider | enum | google, facebook |
| oauth_id | string | Provider-specific user ID |
| created_at | datetime | |

### Pool

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | string | |
| description | string | Optional |
| icon | string | Emoji or icon identifier |
| color | string | Hex color for UI |
| type | enum | private, shared |
| owner_id | uuid | FK → User |
| require_approval | boolean | Default: false |
| approval_threshold | decimal | Only relevant if require_approval = true |
| created_at | datetime | |
| updated_at | datetime | |

**Computed:** `balance` = sum(contributions.amount) - sum(approved expenses.amount)

### PoolMembership

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → User |
| pool_id | uuid | FK → Pool |
| role | enum | owner, admin, member, viewer |
| max_spend_without_approval | decimal | Null = no limit (uses pool default) |
| can_invite | boolean | Default: false |
| can_edit_categories | boolean | Default: false |
| joined_at | datetime | |

### Category

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| pool_id | uuid | FK → Pool |
| name | string | |
| icon | string | Emoji or icon identifier |
| budget_amount | decimal | |
| sort_order | integer | For UI ordering |
| created_at | datetime | |

**Computed:** `remaining` = budget_amount - sum(approved expenses in this category)

### Contribution

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → User |
| pool_id | uuid | FK → Pool |
| amount | decimal | |
| note | string | Optional |
| created_at | datetime | |

### Expense

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → User (who spent) |
| pool_id | uuid | FK → Pool |
| category_id | uuid | FK → Category |
| amount | decimal | |
| description | string | |
| receipt_url | string | Optional, for future OCR |
| status | enum | logged, pending_approval, approved, rejected |
| reviewed_by | uuid | FK → User, nullable |
| reviewed_at | datetime | Nullable |
| created_at | datetime | |

### Invite

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| pool_id | uuid | FK → Pool |
| invited_by | uuid | FK → User |
| token | string | Unique, URL-safe |
| role | enum | admin, member, viewer (role assigned on join) |
| expires_at | datetime | |
| used_at | datetime | Null until claimed |

## User Flows

### 1. Sign Up / Log In

- OAuth only: Google or Facebook via Passport.js
- One-tap entry, no password management
- New users land on empty dashboard with "Create your first pool" prompt

### 2. Create a Pool

1. Dashboard → "New Pool"
2. Enter name, pick icon/color, optional description
3. Add categories + budget per category (or skip, add later)
4. Pool created as private by default
5. Optional: toggle to shared → generate invite link

### 3. Join a Pool via Invite

1. Receive invite link
2. Click → redirect to sign up / log in if needed
3. Land directly in the pool
4. Role assigned per invite link settings

### 4. Contribute to a Pool

1. Inside pool → "Add Money"
2. Enter amount, optional note
3. Contribution logged, pool balance updates instantly
4. All members see update via Pusher realtime

### 5. Log an Expense

1. Inside pool → "Add Expense"
2. Enter amount, pick category, add description
3. **If** pool has `require_approval = true` AND amount > threshold → status: `pending_approval`, admins notified
4. **Else** → logged immediately
5. **If** category goes over budget → warning displayed, expense still logged
6. Pool balance decreases, category remaining updates
7. Realtime update pushed to all members

### 6. Approval Flow (optional)

- Only active when pool owner enables `require_approval`
- Expenses exceeding threshold → `pending_approval`
- Admins/owner receive Pusher notification
- Open expense → Approve (balance decreases) or Reject (no change) with optional note
- Member notified of decision

### 7. Dashboard

- All pools listed (private + shared)
- Per pool card: name, color, balance, top category budget bars, member count
- Tap into pool: full category breakdown, member list, contribution history, expense log, activity feed

### 8. Manage Members & Permissions

- Owner/admin → Pool Settings → Members
- Change role per member
- Set per-member rules (max spend, can invite, can edit categories)
- Remove members, revoke/regenerate invite links

## Tech Stack

| Layer | Technology | Hosting | Monthly Cost |
|-------|-----------|---------|-------------|
| Frontend | React + TypeScript + Vite | Vercel | $0–20 |
| UI / Design System | MUI (Material UI Core, free tier) | — | $0 |
| Backend | NestJS + TypeScript | Railway | $15–30 |
| Database | PostgreSQL | Railway (included) | — |
| ORM | TypeORM | — | — |
| Auth | OAuth 2.0 (Google + Facebook) via Passport.js | — | $0 |
| Realtime | Pusher Channels | Pusher Cloud | $0–49 |
| Push Notifications | Firebase FCM (future, mobile phase) | Google | $0 |
| Domain | .com | Registrar | ~$1 |

### Cost Summary

| Phase | Min | Avg | Max |
|-------|-----|-----|-----|
| Development / testing | $0/mo | $0/mo | $0/mo |
| Launch (< 500 users) | $5/mo | $36/mo | $50/mo |
| Scale (500–2000 users) | $50/mo | $150/mo | $273/mo |
| Annual (launch) | $60/yr | $432/yr | $600/yr |
| Annual (scale) | $600/yr | $1,800/yr | $3,276/yr |

## MVP Scope (v1)

### Included

- OAuth sign up/login (Google + Facebook)
- Create, edit, delete pools (private + shared)
- Categories with budgets per pool
- Flexible contributions (any amount, any time)
- Expense logging against categories with over-budget warnings
- Invite link system (link + account required to join)
- Role-based permissions (owner / admin / member / viewer)
- Configurable approval flow per pool
- Per-member spending rules
- Real-time updates via Pusher (balance changes, new expenses, approval notifications)
- Responsive web design (mobile-friendly)
- Dashboard with all-pools overview

### Excluded from MVP

- Automation engine (OCR, bank sync, AI categorization, recurring detection)
- Native mobile app
- Payment processing (contributions are tracked, not processed externally)
- Export (CSV / PDF)
- Analytics / spending insights
- Multi-currency support
- Receipt scanning
- Voice input

## Future Roadmap

1. **v1.1** — Export (CSV/PDF), spending analytics dashboard
2. **v1.2** — Receipt OCR, smart categorization
3. **v2.0** — Native mobile app (React Native), Firebase FCM push notifications
4. **v2.1** — Bank sync via Open Banking, recurring expense detection
5. **v3.0** — AI automation engine (auto-categorize, pattern detection, rule suggestions)
6. **v3.1** — Multi-currency support, payment processing integration
