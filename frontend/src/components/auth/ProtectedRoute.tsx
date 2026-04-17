import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { useGetMeQuery } from '@/store/api/authApi';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const { isLoading } = useGetMeQuery(undefined, { skip: !token });
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  const redirectTo = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  if (isLoading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
