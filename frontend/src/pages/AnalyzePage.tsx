import { Box, Typography, CircularProgress } from '@mui/material';
import { useGetDashboardQuery } from '@/store/api/dashboardApi';
import BudgetVsActual from '@/components/dashboard/BudgetVsActual';
import ContributionsVsExpenses from '@/components/dashboard/ContributionsVsExpenses';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import MonthlyTrends from '@/components/dashboard/MonthlyTrends';

export default function AnalyzePage() {
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const categoryBudgets = data?.categoryBudgets ?? [];
  const monthlyFlow = data?.monthlyFlow ?? [];
  const spendingBreakdown = data?.spendingBreakdown ?? [];
  const monthlyTrends = data?.monthlyTrends ?? [];

  const hasData = monthlyFlow.length > 0 || categoryBudgets.length > 0 || monthlyTrends.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Analyze</Typography>

      {!hasData ? (
        <Typography color="text.secondary">
          No data yet. Add income and expenses to see your analytics.
        </Typography>
      ) : (
        <>
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
        </>
      )}
    </Box>
  );
}
