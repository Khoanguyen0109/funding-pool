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
