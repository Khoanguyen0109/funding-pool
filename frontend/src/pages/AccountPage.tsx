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
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Stack divider={<Divider />}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Total Balance</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {formatMoney(summary?.totalBalance ?? 0, defaultCurrency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Total Contributed</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatMoney(summary?.totalContributions ?? 0, defaultCurrency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Total Spent</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {formatMoney(summary?.totalExpenses ?? 0, defaultCurrency)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
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
