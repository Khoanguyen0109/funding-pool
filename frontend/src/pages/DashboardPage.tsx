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
