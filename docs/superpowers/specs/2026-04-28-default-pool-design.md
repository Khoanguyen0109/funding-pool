# Default Pool & Dashboard Auto-Redirect — Design Spec

## Overview

Let each signed-in user choose **one default pool** stored on their account. When they open the **dashboard**, if a valid default exists, the app **redirects immediately** to that pool’s detail page (`/pools/:id`) using client-side navigation with `replace: true`, so they do not bounce through dashboard on back navigation.

## Requirements

- **Persistence:** Server-backed (same default on all devices where the user logs in).
- **Validation:** User may only set a pool they belong to as default; clearing sets `defaultPoolId` to `null`.
- **Redirect UX:** No intentional “flash” of dashboard content: redirect runs once dashboard payload is available (same loading state as today until data resolves).
- **Stale references:** If the pool is deleted or the user no longer has access, treat default as invalid—clear server column when possible and stay on dashboard.

## Architecture

### Data model

- Add nullable **`default_pool_id`** on **`users`**, FK → **`pools.id`**, **`ON DELETE SET NULL`** so deleting a pool clears the preference automatically.

### API

| Method | Path | Purpose |
|--------|------|---------|
| GET | Existing **`/dashboard`** | Extend response with **`defaultPoolId: string \| null`** so the dashboard query alone can decide redirect (single round-trip). |
| PATCH | **`/auth/me`** (new) | Body: **`{ defaultPoolId?: string \| null }`**. Validates membership when setting a non-null id; updates user row. |

**Rationale:** Profile-style updates live next to **`GET /auth/me`**; dashboard remains the single source for “my pools + default” for the redirect flow.

### Frontend

- **`DashboardPage`:** After **`useGetDashboardQuery`** succeeds, **`useEffect`** (or equivalent): if **`defaultPoolId`** is non-null **and** matches **`pools.some(p => p.id === defaultPoolId)`**, **`navigate('/pools/' + defaultPoolId, { replace: true })`**.
- **Setting default:** UI control “Make default” / star on pool card and/or pool detail overflow menu; calls **`PATCH /auth/me`** and updates RTK Query cache for **`getMe`** / **`dashboard`** as needed.

### Edge cases

| Situation | Behavior |
|-----------|----------|
| Invalid uuid or not a member | **`400`** / **`403`** from PATCH; no partial update. |
| Pool deleted | FK clears **`default_pool_id`**; next dashboard load has no redirect. |
| User has no default | Normal dashboard. |
| Deep link to **`/dashboard`** | Same redirect rule applies. |

## Testing

- Backend: PATCH rejects non-member pool id; accepts member pool; sets null.
- Frontend: when dashboard returns matching **`defaultPoolId`**, location becomes **`/pools/:id`** with replace; when absent or not in list, stays on dashboard.

## Out of scope (YAGNI)

- Multiple favorites or ordered pin list.
- Auto-setting default when user has exactly one pool (optional follow-up).
