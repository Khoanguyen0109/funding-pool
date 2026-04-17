import { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SummaryCards from '@/components/dashboard/SummaryCards';
import PoolCards from '@/components/dashboard/PoolCards';
import BudgetVsActual from '@/components/dashboard/BudgetVsActual';
import ContributionsVsExpenses from '@/components/dashboard/ContributionsVsExpenses';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import MonthlyTrends from '@/components/dashboard/MonthlyTrends';
import CreatePoolDialog from '@/components/pools/CreatePoolDialog';
import { useGetDashboardQuery } from '@/store/api/dashboardApi';

const EMPTY_SUMMARY = { totalBalance: 0, totalContributions: 0, totalExpenses: 0, poolCount: 0 };

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardQuery();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const pools = data?.pools ?? [];
  const categoryBudgets = data?.categoryBudgets ?? [];
  const monthlyFlow = data?.monthlyFlow ?? [];
  const spendingBreakdown = data?.spendingBreakdown ?? [];
  const monthlyTrends = data?.monthlyTrends ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New Pool
        </Button>
      </Box>

      <SummaryCards data={summary} />

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
          My Pools
        </Typography>
        <PoolCards pools={pools} />
      </Box>

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

      <CreatePoolDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
