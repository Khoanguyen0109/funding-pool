# Default Pool & Dashboard Redirect — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Persist per-user default pool on the server, expose it on the dashboard API, redirect from the dashboard to `/pools/:id` when valid, and allow setting/clearing default from the UI.

**Architecture:** Nullable `default_pool_id` on `users` with FK to `pools`. Extend `GET /dashboard` with `defaultPoolId`. Add `PATCH /auth/me` to update default after membership check. Dashboard page navigates with `replace: true` when the default id is in the loaded pool list.

**Tech Stack:** NestJS, TypeORM, PostgreSQL (assumed), React, RTK Query, React Router.

---

## File map

| Area | Files |
|------|--------|
| Entity / migration | `backend/src/users/entities/user.entity.ts`, new migration under `backend/src/migrations` or project convention |
| Auth | `backend/src/auth/auth.controller.ts`, `auth.service.ts` (if logic grows), `auth.module.ts` imports `UsersService` / pools membership |
| Dashboard | `backend/src/dashboard/dashboard.service.ts`, `dashboard.controller.ts` — extend `DashboardResponse` |
| Pools validation | Reuse `PoolsService.getMembership(poolId, userId)` from auth layer or inject `PoolsService` into `AuthService` |
| Frontend types | `frontend/src/types/index.ts` — dashboard response type |
| API | `frontend/src/store/api/dashboardApi.ts`, auth RTK slice if `PATCH /auth/me` added |
| UI | `frontend/src/pages/DashboardPage.tsx`, `frontend/src/components/dashboard/PoolCards.tsx`, optionally `PoolDetailPage.tsx` menu |

---

## Tasks

- [ ] **1. Migration + entity** — Add `defaultPoolId` (column `default_pool_id`) to `User` with `@ManyToOne` optional relation to `Pool`, FK `ON DELETE SET NULL`. Generate/run migration per repo conventions.

- [ ] **2. Dashboard API** — Include `defaultPoolId` in `DashboardResponse` and populate from `user.defaultPoolId` (load user in dashboard service or join—follow existing pattern for `getDashboard(userId)`).

- [ ] **3. PATCH /auth/me** — Add DTO `UpdateMeDto` with optional `defaultPoolId: string \| null`. Guard: if non-null, assert `PoolsService.getMembership(poolId, user.id)` exists; else `BadRequest`/`Forbidden`. Save user. Return sanitized user (no password).

- [ ] **4. JWT / getMe** — Ensure `GET /auth/me` returns `defaultPoolId` (entity field). Confirm no serializer strips it.

- [ ] **5. Frontend types + dashboard API** — Extend dashboard response type with `defaultPoolId?: string \| null`.

- [ ] **6. RTK mutation** — Add `updateMe` or `patchAuthMe` mutation for `PATCH /auth/me`; tag invalidation for `Dashboard` and `User`/`Auth` queries as appropriate.

- [ ] **7. Dashboard redirect** — In `DashboardPage`, after data loaded: if `defaultPoolId` and pools include that id, `navigate(\`/pools/${defaultPoolId}\`, { replace: true })`. Run once per mount or gate with ref to avoid dev Strict Mode double-nav issues if needed.

- [ ] **8. Set default UI** — Add control on pool cards (icon button or menu item “Make default”) and/or pool detail — calls PATCH; show current default (e.g. filled star).

- [ ] **9. Manual verification** — Log in, set default, visit `/dashboard` → lands on pool. Clear default → stays on dashboard. Delete pool (as owner) → default cleared server-side, no redirect loop.

---

## Testing commands

Run backend unit/e2e if present; otherwise manual API checks with curl + browser. Frontend: smoke test navigation after login.
