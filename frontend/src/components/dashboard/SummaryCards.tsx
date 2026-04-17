import { Box, Card, CardContent, Typography, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PoolIcon from '@mui/icons-material/Savings';
import { formatMoney } from '@/utils/currency';

interface SummaryData {
  totalBalance: number;
  totalContributions: number;
  totalExpenses: number;
  poolCount: number;
}

export default function SummaryCards({ data }: { data: SummaryData }) {
  const { palette } = useTheme();

  const cards = [
    {
      key: 'totalBalance' as const,
      label: 'Total Balance',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />,
      color: palette.secondary.main,
    },
    {
      key: 'totalContributions' as const,
      label: 'Total Contributions',
      icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
      color: palette.success.main,
    },
    {
      key: 'totalExpenses' as const,
      label: 'Total Expenses',
      icon: <TrendingDownIcon sx={{ fontSize: 22 }} />,
      color: palette.primary.light,
    },
    {
      key: 'poolCount' as const,
      label: 'Active Pools',
      icon: <PoolIcon sx={{ fontSize: 22 }} />,
      color: palette.warning.main,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {cards.map((c) => (
        <Card key={c.key}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: alpha(c.color, 0.18),
                  color: c.color,
                }}
              >
                {c.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" noWrap>{c.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25 }}>
                  {c.key === 'poolCount' ? data[c.key] : formatMoney(data[c.key])}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
