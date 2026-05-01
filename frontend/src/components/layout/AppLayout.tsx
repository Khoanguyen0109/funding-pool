import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Container,
  BottomNavigation, BottomNavigationAction, Paper, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import CreatePoolSheet from '@/components/pools/CreatePoolSheet';

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, path: '/dashboard' },
  { label: 'Analyze', icon: <BarChartIcon />, path: '/analyze' },
  { label: 'Account', icon: <PersonIcon />, path: '/account' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);

  const activeIndex = NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));
  const navValue = activeIndex >= 0 ? activeIndex : false;
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: '56px' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            variant="h6"
            onClick={() => navigate('/dashboard')}
            sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
          >
            FundPool
          </Typography>
          {isDashboard && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              New Pool
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <CreatePoolSheet open={createOpen} onClose={() => setCreateOpen(false)} />

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
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction key={item.label} icon={item.icon} aria-label={item.label} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
