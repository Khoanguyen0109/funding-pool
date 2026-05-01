# Bottom Nav + Bottom Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-style bottom navigation bar (Home / Account / Analyze), replace every MUI Dialog with a bottom sheet, and add AccountPage + AnalyzePage.

**Architecture:** A shared `BottomSheet` component wraps MUI `Drawer anchor="bottom"` with rounded-top styling. `AppLayout` gets a `BottomNavigation` bar pinned to the bottom. All 9 dialog usages are converted to use `BottomSheet`. Two new pages are created and wired into the router.

**Tech Stack:** React 19, MUI v6, React Router v6, Redux Toolkit / RTK Query, TypeScript, Vite

---

## Task 1: Create shared `BottomSheet` component

**Files:**
- Create: `frontend/src/components/common/BottomSheet.tsx`

- [ ] **Step 1: Create the file**

```tsx
// frontend/src/components/common/BottomSheet.tsx
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px 20px 0 0',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
      </Box>

      {/* Header */}
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Scrollable content */}
      <Box sx={{ overflowY: 'auto', px: 3, pb: 4 }}>
        {children}
      </Box>
    </Drawer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/common/BottomSheet.tsx
git commit -m "feat: add shared BottomSheet component"
```

---

## Task 2: Add bottom navigation to `AppLayout`

**Files:**
- Modify: `frontend/src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
// frontend/src/components/layout/AppLayout.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Container,
  BottomNavigation, BottomNavigationAction, Paper,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, path: '/dashboard' },
  { label: 'Account', icon: <PersonIcon />, path: '/account' },
  { label: 'Analyze', icon: <BarChartIcon />, path: '/analyze' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeIndex = NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));
  const navValue = activeIndex >= 0 ? activeIndex : false;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: '56px' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 700 }}>
            FundPool
          </Typography>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>

      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <BottomNavigation
          value={navValue}
          onChange={(_, newValue: number) => navigate(NAV_ITEMS[newValue]!.path)}
          showLabels
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction key={item.label} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/AppLayout.tsx
git commit -m "feat: add bottom navigation bar to AppLayout"
```

---

## Task 3: Add `/account` and `/analyze` routes

**Files:**
- Modify: `frontend/src/routes/index.tsx`

- [ ] **Step 1: Add imports and routes**

```tsx
// frontend/src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import PoolDetailPage from '@/pages/PoolDetailPage';
import JoinPoolPage from '@/pages/JoinPoolPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import AccountPage from '@/pages/AccountPage';
import AnalyzePage from '@/pages/AnalyzePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'pools/:id', element: <PoolDetailPage /> },
      { path: 'join/:token', element: <JoinPoolPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'analyze', element: <AnalyzePage /> },
    ],
  },
]);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/routes/index.tsx
git commit -m "feat: add /account and /analyze protected routes"
```

---

## Task 4: Create `AccountPage`

**Files:**
- Create: `frontend/src/pages/AccountPage.tsx`

The `DashboardResponse` type (from `@/types`) includes `summary: { totalBalance, totalContributions, totalExpenses, poolCount }`. Use that for the financial summary cards.

- [ ] **Step 1: Create the file**

```tsx
// frontend/src/pages/AccountPage.tsx
import { Box, Typography, Avatar, Card, CardContent, Stack, Button, Divider, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { apiSlice } from '@/store/api/apiSlice';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardQuery } from '@/store/api/dashboardApi';
import { formatMoney } from '@/utils/currency';

export default function AccountPage() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, isLoading } = useGetDashboardQuery();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate('/login', { replace: true });
  };

  const summary = data?.summary;
  const defaultCurrency = data?.pools?.[0]?.currency ?? 'VND';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Account</Typography>

      {/* Profile card */}
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              sx={{ width: 64, height: 64, fontSize: 28 }}
            >
              {user?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.name ?? '—'}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email ?? user?.phone ?? '—'}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Financial summary */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Financial Summary</Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Stack divider={<Divider />} spacing={0}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Total Balance</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {formatMoney(summary?.totalBalance ?? 0, defaultCurrency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Total Contributed</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatMoney(summary?.totalContributions ?? 0, defaultCurrency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {formatMoney(summary?.totalExpenses ?? 0, defaultCurrency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Pools</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {summary?.poolCount ?? 0}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Logout */}
      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        fullWidth
      >
        Log Out
      </Button>
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/AccountPage.tsx
git commit -m "feat: add AccountPage with profile and financial summary"
```

---

## Task 5: Create `AnalyzePage`

**Files:**
- Create: `frontend/src/pages/AnalyzePage.tsx`

Reuses existing chart components from `@/components/dashboard/`. All data from `useGetDashboardQuery`.

- [ ] **Step 1: Create the file**

```tsx
// frontend/src/pages/AnalyzePage.tsx
import { Box, Typography, CircularProgress } from '@mui/material';
import { useGetDashboardQuery } from '@/store/api/dashboardApi';
import BudgetVsActual from '@/components/dashboard/BudgetVsActual';
import ContributionsVsExpenses from '@/components/dashboard/ContributionsVsExpenses';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import MonthlyTrends from '@/components/dashboard/MonthlyTrends';

export default function AnalyzePage() {
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const categoryBudgets = data?.categoryBudgets ?? [];
  const monthlyFlow = data?.monthlyFlow ?? [];
  const spendingBreakdown = data?.spendingBreakdown ?? [];
  const monthlyTrends = data?.monthlyTrends ?? [];

  const hasData = monthlyFlow.length > 0 || categoryBudgets.length > 0 || monthlyTrends.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Analyze</Typography>

      {!hasData ? (
        <Typography color="text.secondary">
          No data yet. Add income and expenses to see your analytics.
        </Typography>
      ) : (
        <>
          {monthlyFlow.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 3,
              }}
            >
              <ContributionsVsExpenses data={monthlyFlow} />
              <SpendingBreakdown data={spendingBreakdown} />
            </Box>
          )}
          {categoryBudgets.length > 0 && <BudgetVsActual data={categoryBudgets} />}
          {monthlyTrends.length > 0 && <MonthlyTrends data={monthlyTrends} />}
        </>
      )}
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/AnalyzePage.tsx
git commit -m "feat: add AnalyzePage with dashboard charts"
```

---

## Task 6: Convert `AddExpenseDialog` → `AddExpenseSheet`

**Files:**
- Create: `frontend/src/components/pools/AddExpenseSheet.tsx`
- Delete: `frontend/src/components/pools/AddExpenseDialog.tsx` (after updating all imports)

- [ ] **Step 1: Create `AddExpenseSheet.tsx`**

```tsx
// frontend/src/components/pools/AddExpenseSheet.tsx
import { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, MenuItem, Typography, InputAdornment } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreateExpenseMutation } from '@/store/api/expensesApi';
import { getCurrencySymbol, formatCurrencyInput } from '@/utils/currency';
import type { Category } from '@/types';

interface Props {
  poolId: string;
  currency: string;
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

export default function AddExpenseSheet({ poolId, currency, categories, open, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0 || !description.trim() || !categoryId) return;
    try {
      await createExpense({ poolId, amount: parsed, description: description.trim(), categoryId, transactionDate: date || undefined }).unwrap();
      reset();
    } catch {
      // error surfaced via hook
    }
  };

  const handleAmountChange = (value: string) => {
    const { display, raw } = formatCurrencyInput(value);
    setDisplayAmount(display);
    setAmount(raw);
  };

  const reset = () => {
    setAmount('');
    setDisplayAmount('');
    setDescription('');
    setCategoryId('');
    setDate(new Date().toISOString().slice(0, 10));
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={reset} title="Log Expense">
      <Stack spacing={2} sx={{ mt: 1 }}>
        {categories.length === 0 ? (
          <Typography variant="body2" color="warning.main">
            Add a category first before logging expenses.
          </Typography>
        ) : (
          <>
            <TextField
              label="Category"
              select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              fullWidth
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amount"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              fullWidth
              required
              slotProps={{
                htmlInput: { inputMode: 'decimal' },
                input: {
                  startAdornment: <InputAdornment position="start">{getCurrencySymbol(currency)}</InputAdornment>,
                  endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
                },
              }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={reset} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={categories.length === 0 || !amount || !description.trim() || !categoryId || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Log Expense
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/AddExpenseSheet.tsx
git commit -m "feat: add AddExpenseSheet (bottom sheet)"
```

---

## Task 7: Convert `AddIncomeDialog` → `AddIncomeSheet`

**Files:**
- Create: `frontend/src/components/pools/AddIncomeSheet.tsx`

- [ ] **Step 1: Create `AddIncomeSheet.tsx`**

```tsx
// frontend/src/components/pools/AddIncomeSheet.tsx
import { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, InputAdornment } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreateContributionMutation } from '@/store/api/contributionsApi';
import { getCurrencySymbol, formatCurrencyInput } from '@/utils/currency';

interface Props {
  poolId: string;
  currency: string;
  open: boolean;
  onClose: () => void;
}

export default function AddIncomeSheet({ poolId, currency, open, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [createContribution, { isLoading }] = useCreateContributionMutation();

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    try {
      await createContribution({ poolId, amount: parsed, note: note.trim() || undefined, transactionDate: date || undefined }).unwrap();
      reset();
    } catch {
      // error surfaced via hook
    }
  };

  const handleAmountChange = (value: string) => {
    const { display, raw } = formatCurrencyInput(value);
    setDisplayAmount(display);
    setAmount(raw);
  };

  const reset = () => {
    setAmount('');
    setDisplayAmount('');
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={reset} title="Add Income">
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="Amount"
          value={displayAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          fullWidth
          required
          slotProps={{
            htmlInput: { inputMode: 'decimal' },
            input: {
              startAdornment: <InputAdornment position="start">{getCurrencySymbol(currency)}</InputAdornment>,
              endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
            },
          }}
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={reset} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Add Income
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/AddIncomeSheet.tsx
git commit -m "feat: add AddIncomeSheet (bottom sheet)"
```

---

## Task 8: Convert `CreatePoolDialog` → `CreatePoolSheet`

**Files:**
- Create: `frontend/src/components/pools/CreatePoolSheet.tsx`

- [ ] **Step 1: Create `CreatePoolSheet.tsx`**

```tsx
// frontend/src/components/pools/CreatePoolSheet.tsx
import { useState } from 'react';
import {
  TextField, Button, Stack, ToggleButtonGroup, ToggleButton,
  Typography, Box, CircularProgress, MenuItem,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreatePoolMutation } from '@/store/api/poolsApi';
import { CURRENCIES } from '@/utils/currency';

const POOL_COLORS = ['#E91E8C', '#A855F7', '#34D399', '#60A5FA', '#FBBF24', '#F87171'];
const POOL_ICONS = ['💰', '🏠', '✈️', '🎓', '🏥', '🎉', '🛒', '💼'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreatePoolSheet({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'private' | 'shared'>('private');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState(POOL_COLORS[0] ?? '#E91E8C');
  const [currency, setCurrency] = useState('VND');
  const [createPool, { isLoading }] = useCreatePoolMutation();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await createPool({ name: name.trim(), description: description.trim() || '', type, icon, color, currency }).unwrap();
      resetAndClose();
    } catch {
      // RTK Query will surface the error via the hook if needed
    }
  };

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setType('private');
    setIcon('💰');
    setColor(POOL_COLORS[0] ?? '#E91E8C');
    setCurrency('VND');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={resetAndClose} title="Create New Pool">
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <TextField
          label="Pool Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
          required
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <TextField
          label="Currency"
          select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          fullWidth
        >
          {CURRENCIES.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Type</Typography>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, v) => v && setType(v)}
            fullWidth
            size="small"
          >
            <ToggleButton value="private">
              <LockIcon sx={{ mr: 0.5, fontSize: 18 }} /> Private
            </ToggleButton>
            <ToggleButton value="shared">
              <GroupIcon sx={{ mr: 0.5, fontSize: 18 }} /> Shared
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Icon</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {POOL_ICONS.map((ic) => (
              <Box
                key={ic}
                onClick={() => setIcon(ic)}
                sx={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 1, cursor: 'pointer', fontSize: 22,
                  border: icon === ic ? '2px solid' : '1px solid transparent',
                  borderColor: icon === ic ? 'primary.main' : 'transparent',
                  bgcolor: icon === ic ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {ic}
              </Box>
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Color</Typography>
          <Stack direction="row" spacing={1}>
            {POOL_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setColor(c)}
                sx={{
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                  bgcolor: c,
                  border: color === c ? '3px solid white' : '3px solid transparent',
                  boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                }}
              />
            ))}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={resetAndClose} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim() || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Create Pool
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/CreatePoolSheet.tsx
git commit -m "feat: add CreatePoolSheet (bottom sheet)"
```

---

## Task 9: Convert `AddCategoryDialog` → `AddCategorySheet`

**Files:**
- Create: `frontend/src/components/pools/AddCategorySheet.tsx`

- [ ] **Step 1: Create `AddCategorySheet.tsx`**

```tsx
// frontend/src/components/pools/AddCategorySheet.tsx
import { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, Box, Typography, InputAdornment } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreateCategoryMutation } from '@/store/api/categoriesApi';
import { getCurrencySymbol } from '@/utils/currency';

const CATEGORY_ICONS = ['📁', '🍔', '🚗', '🏠', '💊', '🎮', '📚', '✈️', '🛍️', '💡', '📱', '🎵'];

interface Props {
  poolId: string;
  currency: string;
  open: boolean;
  onClose: () => void;
}

export default function AddCategorySheet({ poolId, currency, open, onClose }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleSubmit = async () => {
    const parsed = parseFloat(budgetAmount);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    try {
      await createCategory({ poolId, name: name.trim(), icon, budgetAmount: parsed }).unwrap();
      reset();
    } catch {
      // error surfaced via hook
    }
  };

  const reset = () => {
    setName('');
    setIcon('📁');
    setBudgetAmount('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={reset} title="Add Category">
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
          required
        />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Icon</Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {CATEGORY_ICONS.map((ic) => (
              <Box
                key={ic}
                onClick={() => setIcon(ic)}
                sx={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 1, cursor: 'pointer', fontSize: 20,
                  border: icon === ic ? '2px solid' : '1px solid transparent',
                  borderColor: icon === ic ? 'primary.main' : 'transparent',
                  bgcolor: icon === ic ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {ic}
              </Box>
            ))}
          </Stack>
        </Box>
        <TextField
          label="Budget Amount"
          type="number"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          fullWidth
          required
          slotProps={{
            htmlInput: { min: 0, step: 0.01 },
            input: {
              startAdornment: <InputAdornment position="start">{getCurrencySymbol(currency)}</InputAdornment>,
              endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
            },
          }}
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={reset} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim() || !budgetAmount || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Add Category
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/AddCategorySheet.tsx
git commit -m "feat: add AddCategorySheet (bottom sheet)"
```

---

## Task 10: Convert `EditCategoryDialog` → `EditCategorySheet`

**Files:**
- Create: `frontend/src/components/pools/EditCategorySheet.tsx`

- [ ] **Step 1: Create `EditCategorySheet.tsx`**

```tsx
// frontend/src/components/pools/EditCategorySheet.tsx
import { useState, useEffect } from 'react';
import { TextField, Button, Stack, CircularProgress, Box, Typography, InputAdornment, Alert } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useUpdateCategoryMutation } from '@/store/api/categoriesApi';
import { getCurrencySymbol } from '@/utils/currency';
import type { Category } from '@/types';

const CATEGORY_ICONS = ['📁', '🍔', '🚗', '🏠', '💊', '🎮', '📚', '✈️', '🛍️', '💡', '📱', '🎵'];

interface Props {
  poolId: string;
  currency: string;
  category: Category | null;
  open: boolean;
  onClose: () => void;
}

export default function EditCategorySheet({ poolId, currency, category, open, onClose }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setBudgetAmount(String(category.budgetAmount));
      setError(null);
    }
  }, [category]);

  const handleSubmit = async () => {
    const parsed = parseFloat(budgetAmount);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    setError(null);
    try {
      await updateCategory({ poolId, categoryId: category!.id, name: name.trim(), icon, budgetAmount: parsed }).unwrap();
      onClose();
    } catch (err: unknown) {
      const data = err as { data?: { message?: string | string[] } };
      const m = data?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : (typeof m === 'string' ? m : 'Could not save changes'));
    }
  };

  const isValid = name.trim().length > 0 && budgetAmount !== '' && !isNaN(parseFloat(budgetAmount)) && parseFloat(budgetAmount) >= 0;

  return (
    <BottomSheet open={open} onClose={() => !isLoading && onClose()} title="Edit Category">
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
          required
        />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Icon</Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {CATEGORY_ICONS.map((ic) => (
              <Box
                key={ic}
                onClick={() => setIcon(ic)}
                sx={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 1, cursor: 'pointer', fontSize: 20,
                  border: icon === ic ? '2px solid' : '1px solid transparent',
                  borderColor: icon === ic ? 'primary.main' : 'transparent',
                  bgcolor: icon === ic ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {ic}
              </Box>
            ))}
          </Stack>
        </Box>
        <TextField
          label="Budget Amount"
          type="number"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          fullWidth
          required
          slotProps={{
            htmlInput: { min: 0, step: 0.01 },
            input: {
              startAdornment: <InputAdornment position="start">{getCurrencySymbol(currency)}</InputAdornment>,
              endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
            },
          }}
        />
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose} color="inherit" disabled={isLoading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isValid || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/EditCategorySheet.tsx
git commit -m "feat: add EditCategorySheet (bottom sheet)"
```

---

## Task 11: Convert `DeletePoolDialog` → `DeletePoolSheet`

**Files:**
- Create: `frontend/src/components/pools/DeletePoolSheet.tsx`

- [ ] **Step 1: Create `DeletePoolSheet.tsx`**

```tsx
// frontend/src/components/pools/DeletePoolSheet.tsx
import { useState, useEffect, useCallback } from 'react';
import { Button, Typography, CircularProgress, LinearProgress, Box, Alert, Stack } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import BottomSheet from '@/components/common/BottomSheet';
import { useDeletePoolMutation } from '@/store/api/poolsApi';

function messageFromRtkError(error: FetchBaseQueryError | undefined): string {
  if (!error) return 'Could not delete pool.';
  if (typeof error.data === 'object' && error.data && 'message' in error.data) {
    const m = (error.data as { message?: string | string[] }).message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string') return m;
  }
  if (error.status === 403) return 'Only the pool owner can delete this pool.';
  if (error.status === 404) return 'Pool not found.';
  return typeof error.status === 'number' ? `Request failed (${error.status}).` : 'Could not delete pool.';
}

const COUNTDOWN_SECONDS = 5;

interface Props {
  poolId: string;
  poolName: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeletePoolSheet({ poolId, poolName, open, onClose, onDeleted }: Props) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [deletePool, { isLoading, isError, error, reset }] = useDeletePoolMutation();

  useEffect(() => {
    if (!open) { setCountdown(COUNTDOWN_SECONDS); return; }
    reset();
    setCountdown(COUNTDOWN_SECONDS);
  }, [open, reset]);

  useEffect(() => {
    if (!open || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, countdown]);

  const handleDelete = useCallback(async () => {
    try {
      await deletePool(poolId).unwrap();
      onClose();
      onDeleted();
    } catch {
      // RTK sets isError / error
    }
  }, [deletePool, poolId, onDeleted, onClose]);

  const enabled = countdown <= 0 && !isLoading;
  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <BottomSheet open={open} onClose={onClose} title="Delete Pool">
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningAmberIcon color="error" />
          <Typography variant="body1">
            Are you sure you want to delete <strong>{poolName}</strong>? This will permanently remove all categories, contributions, expenses, and members.
          </Typography>
        </Stack>
        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
          This action cannot be undone.
        </Typography>
        {isError && (
          <Alert severity="error">
            {messageFromRtkError(error as FetchBaseQueryError | undefined)}
          </Alert>
        )}
        {countdown > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Confirm button enables in {countdown}s...
            </Typography>
            <LinearProgress variant="determinate" value={progress} color="error" sx={{ height: 4, borderRadius: 2 }} />
          </Box>
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={!enabled}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {countdown > 0 ? `Delete (${countdown}s)` : 'Delete Pool'}
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/DeletePoolSheet.tsx
git commit -m "feat: add DeletePoolSheet (bottom sheet)"
```

---

## Task 12: Convert `SharePoolDialog` → `SharePoolSheet`

**Files:**
- Create: `frontend/src/components/pools/SharePoolSheet.tsx`

- [ ] **Step 1: Create `SharePoolSheet.tsx`**

```tsx
// frontend/src/components/pools/SharePoolSheet.tsx
import { useState } from 'react';
import { Tabs, Tab, Stack } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import BottomSheet from '@/components/common/BottomSheet';
import ShareLinkTab from './ShareLinkTab';
import ShareQRTab from './ShareQRTab';
import InviteUserTab from './InviteUserTab';
import type { PoolMembership } from '@/types';

interface Props {
  poolId: string;
  poolName: string;
  members: PoolMembership[];
  open: boolean;
  onClose: () => void;
}

export default function SharePoolSheet({ poolId, poolName, members, open, onClose }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <BottomSheet open={open} onClose={onClose} title="Share Pool">
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', mx: -3, mb: 2 }}
      >
        <Tab icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Link" />
        <Tab icon={<QrCode2Icon sx={{ fontSize: 18 }} />} iconPosition="start" label="QR Code" />
        <Tab icon={<PersonSearchIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Invite" />
      </Tabs>
      <Stack sx={{ minHeight: 200 }}>
        {tab === 0 && <ShareLinkTab poolId={poolId} />}
        {tab === 1 && <ShareQRTab poolId={poolId} poolName={poolName} />}
        {tab === 2 && <InviteUserTab poolId={poolId} members={members} />}
      </Stack>
    </BottomSheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/SharePoolSheet.tsx
git commit -m "feat: add SharePoolSheet (bottom sheet)"
```

---

## Task 13: Update `PoolDetailPage` — swap all dialog imports + inline delete-category dialog

**Files:**
- Modify: `frontend/src/pages/PoolDetailPage.tsx`

- [ ] **Step 1: Replace all dialog imports and usages**

In `PoolDetailPage.tsx`, make these changes:

**a) Replace imports at the top of the file:**

Remove from MUI import block: `Dialog, DialogTitle, DialogContent, DialogActions`

Change the component imports:
```tsx
import AddIncomeSheet from '@/components/pools/AddIncomeSheet';
import AddExpenseSheet from '@/components/pools/AddExpenseSheet';
import AddCategorySheet from '@/components/pools/AddCategorySheet';
import EditCategorySheet from '@/components/pools/EditCategorySheet';
import DeletePoolSheet from '@/components/pools/DeletePoolSheet';
import SharePoolSheet from '@/components/pools/SharePoolSheet';
import BottomSheet from '@/components/common/BottomSheet';
```

**b) Replace the bottom dialog section (lines 405–484) with:**

```tsx
      {/* Sheets */}
      <AddIncomeSheet poolId={id!} currency={poolCurrency} open={incomeOpen} onClose={() => setIncomeOpen(false)} />
      <AddExpenseSheet poolId={id!} currency={poolCurrency} categories={categories} open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <AddCategorySheet poolId={id!} currency={poolCurrency} open={categoryOpen} onClose={() => setCategoryOpen(false)} />
      <EditCategorySheet
        poolId={id!}
        currency={poolCurrency}
        category={editCategoryTarget}
        open={Boolean(editCategoryTarget)}
        onClose={() => setEditCategoryTarget(null)}
      />

      {/* Delete category confirm sheet */}
      <BottomSheet
        open={Boolean(deleteCategoryTarget)}
        onClose={() => !isDeletingCategory && setDeleteCategoryTarget(null)}
        title="Delete category?"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {deleteCategoryTarget && (
            <Typography variant="body2" color="text.secondary">
              <strong>{deleteCategoryTarget.icon} {deleteCategoryTarget.name}</strong> will be removed from
              the category list and budget view. Past transactions already logged under this
              category are preserved — they will still appear in the transaction history.
            </Typography>
          )}
          {deleteCategoryError && (
            <Alert severity="error" onClose={() => setDeleteCategoryError(null)}>
              {deleteCategoryError}
            </Alert>
          )}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              onClick={() => setDeleteCategoryTarget(null)}
              color="inherit"
              disabled={isDeletingCategory}
            >
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={isDeletingCategory}
              startIcon={isDeletingCategory ? <CircularProgress size={16} /> : undefined}
              onClick={async () => {
                if (!deleteCategoryTarget) return;
                setDeleteCategoryError(null);
                try {
                  await deleteCategory({ poolId: id!, categoryId: deleteCategoryTarget.id }).unwrap();
                  setDeleteCategoryTarget(null);
                } catch (err: unknown) {
                  const data = err as { data?: { message?: string | string[] } };
                  const m = data?.data?.message;
                  setDeleteCategoryError(
                    Array.isArray(m) ? m.join(', ') : (typeof m === 'string' ? m : 'Could not delete category'),
                  );
                }
              }}
            >
              {isDeletingCategory ? 'Deleting…' : 'Delete'}
            </Button>
          </Stack>
        </Stack>
      </BottomSheet>

      <DeletePoolSheet
        poolId={id!}
        poolName={pool.name}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => navigate('/dashboard')}
      />
      <SharePoolSheet
        poolId={id!}
        poolName={pool.name}
        members={pool.members ?? []}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/PoolDetailPage.tsx
git commit -m "feat: replace all dialogs with bottom sheets in PoolDetailPage"
```

---

## Task 14: Update `TransactionsTab` — replace inline delete-transaction dialog

**Files:**
- Modify: `frontend/src/components/pools/TransactionsTab.tsx`

- [ ] **Step 1: Replace dialog imports and the delete-transaction `<Dialog>` block**

Remove from MUI import: `Dialog, DialogTitle, DialogContent, DialogActions`

Add import:
```tsx
import BottomSheet from '@/components/common/BottomSheet';
```

Replace the `<Dialog open={Boolean(pendingDelete)} ...>...</Dialog>` block (lines 325–355) with:

```tsx
      <BottomSheet
        open={Boolean(pendingDelete)}
        onClose={() => !isDeleting && setPendingDelete(null)}
        title="Delete this transaction?"
      >
        {pendingDelete && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {pendingDelete.description}
              {' · '}
              {pendingDelete.type === 'income' ? '+' : '-'}
              {formatMoney(pendingDelete.amount, currency)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              It will be removed from balances and lists. This uses a soft delete on the server.
            </Typography>
            {deleteError && (
              <Alert severity="error" onClose={() => setDeleteError(null)}>{deleteError}</Alert>
            )}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => setPendingDelete(null)} disabled={isDeleting}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </Stack>
          </Stack>
        )}
      </BottomSheet>
```

**Note:** Read `frontend/src/components/pools/TransactionsTab.tsx` lines 325–355 to get the exact content of the transaction description before replacing, so the typography content is preserved exactly.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/pools/TransactionsTab.tsx
git commit -m "feat: replace delete-transaction dialog with bottom sheet in TransactionsTab"
```

---

## Task 15: Update `DashboardPage` — remove charts, use `CreatePoolSheet`

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
// frontend/src/pages/DashboardPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PoolCards from '@/components/dashboard/PoolCards';
import CreatePoolSheet from '@/components/pools/CreatePoolSheet';
import { useGetDashboardQuery } from '@/store/api/dashboardApi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirected = useRef(false);
  const fromLogin = (location.state as { fromLogin?: boolean } | null)?.fromLogin === true;
  const { data, isLoading } = useGetDashboardQuery();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!fromLogin || isLoading || !data || redirected.current) return;
    const { defaultPoolId, pools } = data;
    if (defaultPoolId && pools.some((p) => p.id === defaultPoolId)) {
      redirected.current = true;
      navigate(`/pools/${defaultPoolId}`, { replace: true });
    }
  }, [fromLogin, data, isLoading, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const pools = data?.pools ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Home
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New Pool
        </Button>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
          My Pools
        </Typography>
        <PoolCards pools={pools} defaultPoolId={data?.defaultPoolId ?? null} />
      </Box>

      <CreatePoolSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DashboardPage.tsx
git commit -m "feat: simplify DashboardPage to pools-only, move charts to AnalyzePage"
```

---

## Task 16: Delete old Dialog files

**Files:**
- Delete: `frontend/src/components/pools/AddExpenseDialog.tsx`
- Delete: `frontend/src/components/pools/AddIncomeDialog.tsx`
- Delete: `frontend/src/components/pools/CreatePoolDialog.tsx`
- Delete: `frontend/src/components/pools/AddCategoryDialog.tsx`
- Delete: `frontend/src/components/pools/EditCategoryDialog.tsx`
- Delete: `frontend/src/components/pools/DeletePoolDialog.tsx`
- Delete: `frontend/src/components/pools/SharePoolDialog.tsx`

- [ ] **Step 1: Delete old files**

```bash
git rm frontend/src/components/pools/AddExpenseDialog.tsx \
       frontend/src/components/pools/AddIncomeDialog.tsx \
       frontend/src/components/pools/CreatePoolDialog.tsx \
       frontend/src/components/pools/AddCategoryDialog.tsx \
       frontend/src/components/pools/EditCategoryDialog.tsx \
       frontend/src/components/pools/DeletePoolDialog.tsx \
       frontend/src/components/pools/SharePoolDialog.tsx
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove old Dialog files replaced by Sheet components"
```

---

## Task 17: Type-check the whole frontend

- [ ] **Step 1: Run TypeScript compiler**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors. If errors appear, fix them before proceeding.

- [ ] **Step 2: Commit any fixes**

```bash
git add -A && git commit -m "fix: TypeScript errors after bottom sheet migration"
```
