# RTK Query Integration Plan

**Goal:** Replace Axios + AuthContext with Redux Toolkit + RTK Query for all API communication, using a hybrid approach (auth slice + RTK Query endpoints for everything).

**Architecture:** A single Redux store with an `authSlice` (token + user state) and one RTK Query `apiSlice` (all endpoints). `prepareHeaders` reads the token from the auth slice. A `baseQueryWithReauth` wrapper handles 401s. All pages/components consume RTK Query hooks instead of manual Axios calls.

**Tech Stack:** `@reduxjs/toolkit`, `react-redux`

---

## File Map

### New files to create

| File | Responsibility |
|------|----------------|
| `src/store/index.ts` | `configureStore` — combines authSlice + apiSlice |
| `src/store/authSlice.ts` | Token + user state, `setCredentials` / `logout` actions, `localStorage` sync |
| `src/store/api/baseQuery.ts` | `fetchBaseQuery` + `prepareHeaders` + 401 reauth wrapper |
| `src/store/api/apiSlice.ts` | `createApi` with `tagTypes` — empty endpoints (split by feature) |
| `src/store/api/authApi.ts` | `injectEndpoints` — `login`, `signup`, `getMe` |
| `src/store/api/poolsApi.ts` | `injectEndpoints` — `getPools`, `getPool`, `createPool` |
| `src/store/hooks.ts` | Typed `useAppDispatch` / `useAppSelector` |

### Files to modify

| File | Change |
|------|--------|
| `src/App.tsx` | Wrap with `<Provider store={store}>`, remove `<AuthProvider>` |
| `src/pages/LoginPage.tsx` | Use `useLoginMutation` instead of `authApi.login` + `useAuth` |
| `src/pages/SignupPage.tsx` | Use `useSignupMutation` instead of `authApi.signup` + `useAuth` |
| `src/pages/AuthCallbackPage.tsx` | Dispatch `setCredentials` + `useGetMeQuery` instead of `useAuth().login` |
| `src/pages/DashboardPage.tsx` | Use `useGetPoolsQuery` to replace mock data (pools section only) |
| `src/components/auth/ProtectedRoute.tsx` | Use `useAppSelector` for auth state instead of `useAuth` |
| `src/components/layout/AppLayout.tsx` | Use `useAppSelector` / `useAppDispatch` instead of `useAuth` |

### Files to delete (after migration)

| File | Reason |
|------|--------|
| `src/contexts/AuthContext.tsx` | Replaced by `authSlice` + RTK Query auth endpoints |
| `src/api/client.ts` | Replaced by `baseQuery.ts` (fetchBaseQuery) |
| `src/api/auth.ts` | Replaced by `authApi.ts` (RTK Query endpoints) |

---

## Task 1: Install dependencies

- [ ] **Step 1: Add packages**

```bash
cd frontend && yarn add @reduxjs/toolkit react-redux
```

- [ ] **Step 2: Verify installation**

```bash
yarn list @reduxjs/toolkit react-redux
```

---

## Task 2: Create the auth slice

**Files:**
- Create: `src/store/authSlice.ts`

- [ ] **Step 1: Create `src/store/authSlice.ts`**

```typescript
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('access_token'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user?: User }>) {
      state.token = action.payload.token;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      localStorage.setItem('access_token', action.payload.token);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('access_token');
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
```

**Key decisions:**
- `initialState.token` reads from `localStorage` on boot so the token survives page refresh
- `setCredentials` writes to `localStorage` immediately — no separate sync needed
- `logout` clears both Redux state and `localStorage`

---

## Task 3: Create base query with reauth

**Files:**
- Create: `src/store/api/baseQuery.ts`

- [ ] **Step 1: Create `src/store/api/baseQuery.ts`**

```typescript
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '@/store';
import { logout } from '@/store/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
    // Redirect handled by ProtectedRoute re-rendering
  }

  return result;
};
```

**Notes:**
- No refresh token endpoint exists on the backend, so on 401 we just log out (same behavior as current Axios interceptor)
- `prepareHeaders` reads token from Redux store, not `localStorage`
- If a refresh token endpoint is added later, the reauth logic goes here

---

## Task 4: Create the API slice

**Files:**
- Create: `src/store/api/apiSlice.ts`

- [ ] **Step 1: Create `src/store/api/apiSlice.ts`**

```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Pool', 'User'],
  endpoints: () => ({}),
});
```

**Notes:**
- Empty endpoints — each feature file uses `apiSlice.injectEndpoints()`
- `tagTypes` lists cache tags for automatic invalidation
- Add more tag types (`Category`, `Contribution`, `Expense`, `Invite`) as those endpoints are built

---

## Task 5: Create auth API endpoints

**Files:**
- Create: `src/store/api/authApi.ts`

- [ ] **Step 1: Create `src/store/api/authApi.ts`**

```typescript
import type { User, AuthResponse, LoginPayload, SignupPayload } from '@/types';
import { apiSlice } from './apiSlice';
import { setCredentials, setUser } from '@/store/authSlice';

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),

    signup: builder.mutation<AuthResponse, SignupPayload>({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),

    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGetMeQuery } = authApi;
```

**Key points:**
- `onQueryStarted` dispatches token/user to the auth slice after successful API call
- `login`/`signup` are **mutations** (they change server state)
- `getMe` is a **query** (read-only), provides `User` tag for cache invalidation on logout

---

## Task 6: Create pools API endpoints

**Files:**
- Create: `src/store/api/poolsApi.ts`

- [ ] **Step 1: Create `src/store/api/poolsApi.ts`**

```typescript
import type { Pool } from '@/types';
import { apiSlice } from './apiSlice';

interface CreatePoolPayload {
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: 'private' | 'shared';
  requireApproval?: boolean;
  approvalThreshold?: number;
}

const poolsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPools: builder.query<Pool[], void>({
      query: () => '/pools',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Pool' as const, id })),
              { type: 'Pool', id: 'LIST' },
            ]
          : [{ type: 'Pool', id: 'LIST' }],
    }),

    getPool: builder.query<Pool, string>({
      query: (id) => `/pools/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Pool', id }],
    }),

    createPool: builder.mutation<Pool, CreatePoolPayload>({
      query: (body) => ({
        url: '/pools',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Pool', id: 'LIST' }],
    }),
  }),
});

export const { useGetPoolsQuery, useGetPoolQuery, useCreatePoolMutation } = poolsApi;
```

**Notes:**
- `providesTags` on `getPools` tags each pool individually + a `LIST` tag
- `createPool` invalidates the `LIST` tag so the pools list auto-refetches
- Types match the backend `PoolsController` endpoints

---

## Task 7: Create the store and typed hooks

**Files:**
- Create: `src/store/index.ts`
- Create: `src/store/hooks.ts`

- [ ] **Step 1: Create `src/store/index.ts`**

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

- [ ] **Step 2: Create `src/store/hooks.ts`**

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

---

## Task 8: Wire store into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace `AuthProvider` with Redux `Provider`**

Change `App.tsx` from:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
```

to:

```typescript
import { Provider } from 'react-redux';
import { store } from '@/store';
```

And update the JSX from:

```tsx
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>
```

to:

```tsx
<Provider store={store}>
  <RouterProvider router={router} />
</Provider>
```

---

## Task 9: Migrate ProtectedRoute

**Files:**
- Modify: `src/components/auth/ProtectedRoute.tsx`

- [ ] **Step 1: Replace `useAuth` with RTK Query + auth slice**

```typescript
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { useGetMeQuery } from '@/store/api/authApi';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const { isLoading } = useGetMeQuery(undefined, { skip: !token });
  const user = useAppSelector((state) => state.auth.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Key change:** `useGetMeQuery` fires on mount when there's a token but no user yet (page refresh). It skips if there's no token. The `onQueryStarted` in `authApi.ts` populates `authSlice.user` automatically.

---

## Task 10: Migrate LoginPage

**Files:**
- Modify: `src/pages/LoginPage.tsx`

- [ ] **Step 1: Replace auth imports and logic**

Replace:
```typescript
import { authApi } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
```

With:
```typescript
import { useLoginMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
```

Replace the hooks at top of component:
```typescript
const { login, isAuthenticated, isLoading } = useAuth();
```

With:
```typescript
const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
const isAuthenticated = useAppSelector((state) => !!state.auth.user);
const token = useAppSelector((state) => state.auth.token);
```

Replace the redirect check:
```typescript
if (!isLoading && isAuthenticated) {
```

With:
```typescript
if (isAuthenticated || token) {
```

Replace `handleSubmit` body:
```typescript
try {
  const payload = method === 'email' ? { email, password } : { phone, password };
  await loginMutation(payload).unwrap();
  navigate('/dashboard', { replace: true });
} catch (err: any) {
  setError(err.data?.message || 'Invalid credentials');
}
```

Remove the `loading` state variable — use `isLoginLoading` from the mutation hook instead. Update button:
```tsx
<Button type="submit" variant="contained" size="large" fullWidth disabled={isLoginLoading}>
  {isLoginLoading ? 'Signing in...' : 'Sign in'}
</Button>
```

---

## Task 11: Migrate SignupPage

**Files:**
- Modify: `src/pages/SignupPage.tsx`

- [ ] **Step 1: Same pattern as LoginPage**

Replace:
```typescript
import { authApi } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
```

With:
```typescript
import { useSignupMutation } from '@/store/api/authApi';
```

Replace hooks:
```typescript
const { login } = useAuth();
```

With:
```typescript
const [signupMutation, { isLoading: isSignupLoading }] = useSignupMutation();
```

Replace `handleSubmit` try block:
```typescript
try {
  const payload = {
    name,
    password,
    ...(method === 'email' ? { email } : { phone }),
  };
  await signupMutation(payload).unwrap();
  navigate('/dashboard', { replace: true });
} catch (err: any) {
  setError(err.data?.message || 'Something went wrong');
}
```

Remove `loading` state, use `isSignupLoading` for the button disabled/text.

---

## Task 12: Migrate AuthCallbackPage

**Files:**
- Modify: `src/pages/AuthCallbackPage.tsx`

- [ ] **Step 1: Dispatch token into store instead of calling `useAuth().login`**

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      dispatch(setCredentials({ token }));
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress size={48} />
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Signing you in...
      </Typography>
    </Box>
  );
}
```

**Note:** OAuth callback only gives us a token (no user object). `ProtectedRoute` will fire `useGetMeQuery` to fetch the user when the dashboard loads.

---

## Task 13: Migrate AppLayout

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Replace `useAuth` with Redux hooks**

Replace:
```typescript
import { useAuth } from '@/contexts/AuthContext';
```

With:
```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { apiSlice } from '@/store/api/apiSlice';
```

Replace:
```typescript
const { user, logout } = useAuth();
```

With:
```typescript
const user = useAppSelector((state) => state.auth.user);
const dispatch = useAppDispatch();

const handleLogout = () => {
  dispatch(logout());
  dispatch(apiSlice.util.resetApiState());
};
```

Update the `onClick` from `logout` to `handleLogout`.

**Key:** `apiSlice.util.resetApiState()` clears all cached RTK Query data on logout, preventing stale data from being visible if a different user logs in.

---

## Task 14: Wire DashboardPage pools to real API

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Replace mock pools with `useGetPoolsQuery`**

Add import:
```typescript
import { useGetPoolsQuery } from '@/store/api/poolsApi';
```

Add the query hook at the top of the component:
```typescript
const { data: pools, isLoading: poolsLoading } = useGetPoolsQuery();
```

Replace the `<PoolCards pools={MOCK_POOLS} />` with:
```tsx
<PoolCards pools={pools ?? []} loading={poolsLoading} />
```

Remove `MOCK_POOLS` from the import. Keep other mock imports for now (summary, charts) since those don't have backend endpoints yet.

---

## Task 15: Clean up old files

**Files:**
- Delete: `src/contexts/AuthContext.tsx`
- Delete: `src/api/client.ts`
- Delete: `src/api/auth.ts`

- [ ] **Step 1: Delete old files**

```bash
rm src/contexts/AuthContext.tsx src/api/client.ts src/api/auth.ts
```

- [ ] **Step 2: Verify no remaining imports**

```bash
grep -r "contexts/AuthContext\|api/client\|api/auth\|useAuth" src/
```

Expected: no matches.

- [ ] **Step 3: Verify the app compiles**

```bash
yarn build
```

---

## Summary: What changes where

```
src/
├── store/                      ← NEW (all new files)
│   ├── index.ts                  configureStore
│   ├── hooks.ts                  typed useAppDispatch / useAppSelector
│   ├── authSlice.ts              token + user state
│   └── api/
│       ├── baseQuery.ts          fetchBaseQuery + 401 handler
│       ├── apiSlice.ts           createApi (empty, split by feature)
│       ├── authApi.ts            login / signup / getMe
│       └── poolsApi.ts           getPools / getPool / createPool
├── App.tsx                     ← MODIFIED (Provider replaces AuthProvider)
├── pages/
│   ├── LoginPage.tsx           ← MODIFIED (useLoginMutation)
│   ├── SignupPage.tsx          ← MODIFIED (useSignupMutation)
│   ├── AuthCallbackPage.tsx    ← MODIFIED (dispatch setCredentials)
│   └── DashboardPage.tsx       ← MODIFIED (useGetPoolsQuery for pools)
├── components/
│   ├── auth/ProtectedRoute.tsx ← MODIFIED (useAppSelector + useGetMeQuery)
│   └── layout/AppLayout.tsx    ← MODIFIED (useAppSelector + dispatch)
├── contexts/AuthContext.tsx    ← DELETED
├── api/client.ts               ← DELETED
└── api/auth.ts                 ← DELETED
```

## Future extensions (not in this plan)

Once this is wired, adding more endpoints follows the same pattern:
- Create `src/store/api/categoriesApi.ts` → `injectEndpoints` on `apiSlice`
- Create `src/store/api/contributionsApi.ts`
- Create `src/store/api/expensesApi.ts`
- Create `src/store/api/invitesApi.ts`
- Add `tagTypes` for each and use `providesTags` / `invalidatesTags` for cache sync
- This requires building out the corresponding NestJS controllers first
