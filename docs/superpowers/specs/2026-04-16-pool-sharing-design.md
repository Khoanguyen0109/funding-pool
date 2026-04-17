# Pool Sharing & Invite System — Design Spec

## Overview

Enable pool owners to invite contributors via shareable link, QR code, or direct user search. All methods use a unified invite token system. Joining requires owner approval.

## Requirements

- **Goal:** Let new users join a pool and actively contribute money
- **Prerequisite:** Recipients must already have an account
- **Approval:** Link/QR joins require owner approval. Direct invites auto-approve when the invitee accepts (owner already chose them)
- **Sharing methods:** Link, QR code, search existing users by email/phone
- **Expiry:** Link and QR invite tokens expire after 7 days
- **UI entry point:** Prominent Share button in the pool detail header

## Architecture: Unified Invite Token

All three sharing methods create an `Invite` record with a cryptographic token. Link and QR encode the same token URL. Direct user invites create a targeted invite with the recipient's user ID.

**Approval distinction:**
- **Link/QR invites:** Redeeming creates a `pending` membership → owner approves or rejects
- **Direct invites:** Owner explicitly chose the user, so when the invitee accepts, membership is created as `active` immediately (no second approval needed)

### Why unified

- Single redemption flow, single approval flow
- All invites trackable/revocable in one place
- Builds on the existing `Invite` entity scaffold

## Data Model Changes

### Invite entity (update existing)

Table: `invites`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK (existing) |
| poolId | uuid | FK → pools (existing) |
| invitedBy | uuid | FK → users (existing) |
| token | string | Unique, crypto-random (existing) |
| role | enum | Default `member` (existing) |
| expiresAt | timestamp | Created as `now + 7 days` (existing) |
| usedAt | timestamp | Nullable (existing) |
| createdAt | timestamp | (existing) |
| **type** | enum | **NEW** — `link` or `direct` |
| **inviteeId** | uuid | **NEW** — Nullable FK → users. Null for link/QR, set for direct invites |

**Rules:**
- `type = 'link'`: Reusable by multiple users until expiry. `usedAt` is NOT set on redemption (stays reusable). `inviteeId` is null.
- `type = 'direct'`: Single-use, tied to one user. `usedAt` set on redemption. `inviteeId` is set.

### PoolMembership entity (update existing)

Add column:

| Column | Type | Notes |
|--------|------|-------|
| **status** | enum | **NEW** — `pending` \| `active`. Default `active` for backward compatibility |

Existing memberships (created via pool creation) get `status = 'active'`.

New memberships created via invite redemption get `status = 'pending'`.

**Queries that load pool members for display (balances, contributions, member lists) must filter to `status = 'active'`**, except the owner's pending-requests view.

### User entity

No changes. The existing `email` and `phone` fields (if present) are used for search. If only `email` exists, search is email-only for now.

## API Endpoints

All endpoints require JWT authentication.

### Invite management (owner/admin)

| Method | Path | Body/Query | Response | Notes |
|--------|------|------------|----------|-------|
| POST | `/pools/:id/invites` | `{ type: 'link' }` or `{ type: 'direct', inviteeId: uuid }` | `{ invite }` | Creates invite with 7-day expiry. For direct: validates user exists and isn't already a member |
| GET | `/pools/:id/invites` | — | `{ invites[] }` | Lists active (non-expired, non-revoked) invites for the pool |
| DELETE | `/pools/:id/invites/:inviteId` | — | 204 | Revokes an invite |

### Invite redemption (any authenticated user)

| Method | Path | Body/Query | Response | Notes |
|--------|------|------------|----------|-------|
| GET | `/invites/:token` | — | `{ pool: { name, description, icon, color, owner }, expired: bool }` | Preview pool info before joining. No auth on pool membership required |
| POST | `/invites/:token/redeem` | — | `{ membership }` | Validates: token not expired, user not already a member. For link invites: creates `pending` membership. For direct invites: validates `inviteeId` matches current user, creates `active` membership |

### Member approval (owner)

| Method | Path | Body/Query | Response | Notes |
|--------|------|------------|----------|-------|
| GET | `/pools/:id/members/pending` | — | `{ members[] }` | Lists pending join requests with user info and invite source |
| PATCH | `/pools/:id/members/:userId/approve` | — | `{ membership }` | Sets status to `active` |
| PATCH | `/pools/:id/members/:userId/reject` | — | 204 | Deletes the pending membership |

### Invitee's pending invitations

| Method | Path | Body/Query | Response | Notes |
|--------|------|------------|----------|-------|
| GET | `/users/me/invitations` | — | `{ invitations[] }` | Lists direct invites where `inviteeId` = current user and not yet redeemed/expired. Includes pool preview info |

### User search (any authenticated user)

| Method | Path | Body/Query | Response | Notes |
|--------|------|------------|----------|-------|
| GET | `/users/search?q=...` | `q` = email or phone substring | `{ users[] }` | Returns matching users (id, name, email, avatar). Min 3 chars. Excludes current user |

## Frontend Components

### New components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SharePoolDialog` | `components/pools/SharePoolDialog.tsx` | Main dialog with 3 MUI tabs |
| `ShareLinkTab` | `components/pools/ShareLinkTab.tsx` | Generate link, copy to clipboard, regenerate |
| `ShareQRTab` | `components/pools/ShareQRTab.tsx` | QR code render via `qrcode.react`, download as PNG |
| `InviteUserTab` | `components/pools/InviteUserTab.tsx` | Search users by email/phone, send direct invite |
| `PendingMembersSection` | `components/pools/PendingMembersSection.tsx` | Accept/reject UI at top of Members tab (owner only) |
| `PendingInvitationsCard` | `components/dashboard/PendingInvitationsCard.tsx` | Shows direct invites awaiting the user's acceptance on the dashboard |
| `JoinPoolPage` | `pages/JoinPoolPage.tsx` | Pool preview + "Request to Join" button at `/join/:token` |

### New RTK Query slices

| File | Endpoints |
|------|-----------|
| `store/api/invitesApi.ts` | `createInvite`, `getInvites`, `revokeInvite`, `getInvitePreview`, `redeemInvite`, `getMyInvitations` |
| `store/api/membersApi.ts` | `getPendingMembers`, `approveMember`, `rejectMember` |
| `store/api/usersApi.ts` | `searchUsers` (debounced) |

### New route

- `/join/:token` → `JoinPoolPage` — Requires authentication but not pool membership

### Changes to existing code

- **`PoolDetailPage.tsx`** — Add Share icon button (`ShareRounded`) in the pool header, next to the existing overflow menu. Opens `SharePoolDialog`.
- **Members tab in `PoolDetailPage.tsx`** — Integrate `PendingMembersSection` at top when user is owner and pending count > 0.
- **`types/index.ts`** — Add `status` to `PoolMembership` type, add `Invite` type updates, add `InviteType` enum.
- **`routes/index.tsx`** — Add `/join/:token` route inside the protected layout.
- **`DashboardPage.tsx`** — Integrate `PendingInvitationsCard` above pool cards when the user has pending direct invites.

### New dependency

- `qrcode.react` — QR code rendering for `ShareQRTab`

## UI Flow Details

### Share Dialog

Opened from the Share button in the pool header. Three tabs:

1. **Link tab** — On open, auto-creates a link invite if none exists (or shows the active one). Read-only URL field + "Copy" button. Shows "Expires in X days". "Regenerate" revokes old link and creates a new one.

2. **QR Code tab** — Renders the same link invite URL as a QR code. "Save QR Image" downloads the PNG. Same expiry info.

3. **Invite User tab** — Text input for email/phone search (debounced, min 3 chars). Results list shows avatar, name, contact. "Invite" button per user. Users who are already members or have pending invites are visually marked (chip: "Member" or "Invited").

### Join Pool Page (`/join/:token`)

1. User opens link → redirected to `/login` if not authenticated, then back to `/join/:token`
2. Page shows pool preview: name, icon, description, owner name
3. If token expired: show "This invite has expired" message
4. If user is already a member: show "You're already a member" with link to pool
5. If user already has a pending request: show "Your request is pending approval"
6. Otherwise: "Request to Join" button → calls redeem → shows "Request sent! Waiting for owner approval"

### Invitee's Dashboard — Pending Invitations

When a user has been directly invited to pools, a `PendingInvitationsCard` appears on their dashboard (above the pool cards). Shows pool name, icon, who invited them, and "Accept" / "Decline" buttons. Accepting calls `redeemInvite` → membership created as `active` → pool appears in their pool list. Declining calls `revokeInvite` (or a dedicated decline endpoint).

### Approval in Members Tab

- `PendingMembersSection` renders at the top of Members tab when there are pending requests
- Each pending member shows: avatar, name, invite source ("Via invite link" or "Via direct invite"), time ago
- Accept button → `approveMember` mutation → member moves to active list
- Reject button → `rejectMember` mutation → member removed from pending list
- Badge count on Members tab label when pending > 0

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Expired token | Join page shows "This invite has expired" |
| Already a member | Join page shows "You're already a member" with link |
| Already pending | Join page shows "Your request is pending" |
| Direct invite wrong user | Redeem returns 403 "This invite is for another user" |
| User not found (search) | Empty results with "No users found" message |
| Network errors | Standard RTK Query error handling with toast notifications |

## Security

- Tokens are crypto-random (UUID v4 or nanoid), not guessable
- All invite management endpoints check pool ownership/admin role
- Redeem endpoint validates token expiry server-side
- User search returns minimal info (id, name, email/phone, avatar) — no sensitive data
- Direct invites can only be redeemed by the targeted user
