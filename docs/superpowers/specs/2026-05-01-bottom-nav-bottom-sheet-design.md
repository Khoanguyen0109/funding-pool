# Bottom Nav + Bottom Sheet Design

**Date:** 2026-05-01  
**Status:** Approved

## Summary

Replace the current minimal top-bar-only navigation with a mobile-style bottom navigation bar, and replace all modal dialogs with bottom sheets. Add two new pages: Account and Analyze.

---

## 1. Bottom Navigation Bar

### Placement
Added to `AppLayout` (`frontend/src/components/layout/AppLayout.tsx`), pinned to the bottom of the screen using MUI `BottomNavigation` + `BottomNavigationAction`.

### Tabs

| Label | Icon | Route |
|-------|------|-------|
| Home | `HomeIcon` | `/dashboard` |
| Account | `PersonIcon` | `/account` |
| Analyze | `BarChartIcon` | `/analyze` |

### Behavior
- Active tab derived from `useLocation()` — syncs with browser navigation.
- Always visible on all protected routes (including `PoolDetailPage`).
- Main content area gets `paddingBottom: 56px` so content is never hidden behind the nav bar.
- The existing top `AppBar` is kept — it handles the pool detail back button and page title.

---

## 2. Shared BottomSheet Component

### Location
`frontend/src/components/common/BottomSheet.tsx`

### Props
```ts
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

### Behavior & Style
- Wraps MUI `Drawer anchor="bottom"`.
- Rounded top corners: `borderRadius: '20px 20px 0 0'`.
- Centered drag-handle bar at the top (visual only, no gesture).
- `maxHeight: 90vh` with internal scroll (`overflowY: 'auto'`) so tall forms don't overflow.
- Closes on backdrop tap.
- Title rendered as a bold heading inside the sheet if provided.

---

## 3. Dialog → Sheet Migration

All 9 existing dialog usages are converted to bottom sheets. Files in `components/pools/` are renamed `*Dialog.tsx` → `*Sheet.tsx`.

| Old File | New File | Used In |
|----------|----------|---------|
| `AddExpenseDialog.tsx` | `AddExpenseSheet.tsx` | `PoolDetailPage` |
| `AddIncomeDialog.tsx` | `AddIncomeSheet.tsx` | `PoolDetailPage` |
| `CreatePoolDialog.tsx` | `CreatePoolSheet.tsx` | `DashboardPage` |
| `AddCategoryDialog.tsx` | `AddCategorySheet.tsx` | `PoolDetailPage` |
| `EditCategoryDialog.tsx` | `EditCategorySheet.tsx` | `PoolDetailPage` |
| `DeletePoolDialog.tsx` | `DeletePoolSheet.tsx` | `PoolDetailPage` |
| `SharePoolDialog.tsx` | `SharePoolSheet.tsx` | `PoolDetailPage` |
| Inline delete-category `Dialog` | Inline `BottomSheet` | `PoolDetailPage` |
| Inline delete-transaction `Dialog` | Inline `BottomSheet` | `TransactionsTab` |

All MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` imports replaced with `BottomSheet` wrapper + plain `Box`/`Stack` layout inside.

---

## 4. New Pages

### AccountPage (`/account`)
**File:** `frontend/src/pages/AccountPage.tsx`

Sections:
- User avatar, display name, email (from Redux `authSlice`).
- Financial summary cards: Total Contributed, Total Spent, Net Balance (sourced from `useGetDashboardQuery`).
- Logout button.

### AnalyzePage (`/analyze`)
**File:** `frontend/src/pages/AnalyzePage.tsx`

The charts currently on `DashboardPage` are **moved** (not duplicated) to `AnalyzePage`, keeping Dashboard focused purely on the pool cards list.

Sections (all reusing existing chart components):
- **Spending by Category** — reuses `SpendingBreakdown` component.
- **Pool Breakdown** — reuses `ContributionsVsExpenses` component.
- **Budget vs Actual** — reuses `BudgetVsActual` component.
- **Month-over-Month** — reuses `MonthlyTrends` component.

Data sourced from `useGetDashboardQuery`.

### DashboardPage (updated)
After the charts move to Analyze, `DashboardPage` shows:
- "New Pool" header button.
- `PoolCards` list only.
- `CreatePoolSheet` (was `CreatePoolDialog`).

---

## 5. Router Changes

Add two new protected child routes inside the existing `AppLayout` wrapper in `frontend/src/routes/index.tsx`:

```
/account  → AccountPage
/analyze  → AnalyzePage
```

---

## 6. File Changes Summary

**New files:**
- `frontend/src/components/common/BottomSheet.tsx`
- `frontend/src/pages/AccountPage.tsx`
- `frontend/src/pages/AnalyzePage.tsx`

**Modified files:**
- `frontend/src/components/layout/AppLayout.tsx` — add BottomNavigation
- `frontend/src/routes/index.tsx` — add /account, /analyze routes
- `frontend/src/pages/DashboardPage.tsx` — use CreatePoolSheet
- `frontend/src/pages/PoolDetailPage.tsx` — use all sheets, inline sheet replacements
- `frontend/src/components/pools/TransactionsTab.tsx` — inline sheet replacement

**Renamed + converted files (7 Dialog → Sheet):**
- `AddExpenseDialog.tsx` → `AddExpenseSheet.tsx`
- `AddIncomeDialog.tsx` → `AddIncomeSheet.tsx`
- `CreatePoolDialog.tsx` → `CreatePoolSheet.tsx`
- `AddCategoryDialog.tsx` → `AddCategorySheet.tsx`
- `EditCategoryDialog.tsx` → `EditCategorySheet.tsx`
- `DeletePoolDialog.tsx` → `DeletePoolSheet.tsx`
- `SharePoolDialog.tsx` → `SharePoolSheet.tsx`
