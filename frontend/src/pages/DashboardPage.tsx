import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import PoolCards from '@/components/dashboard/PoolCards';
import { useGetDashboardQuery } from '@/store/api/dashboardApi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirected = useRef(false);
  const fromLogin = (location.state as { fromLogin?: boolean } | null)?.fromLogin === true;
  const { data, isLoading } = useGetDashboardQuery();
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        My Pools
      </Typography>
      <PoolCards pools={pools} defaultPoolId={data?.defaultPoolId ?? null} />
    </Box>
  );
}
