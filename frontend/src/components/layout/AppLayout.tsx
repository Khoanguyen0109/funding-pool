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
