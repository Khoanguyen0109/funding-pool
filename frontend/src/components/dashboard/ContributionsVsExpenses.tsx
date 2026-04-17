import { Card, CardContent, Typography } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CHART_GRID,
  CHART_TICK,
  CHART_TOOLTIP_STYLE,
  CHART_TOOLTIP_LABEL,
  CHART_TOOLTIP_ITEM,
  CHART_COLORS,
  formatCurrency,
  formatAxis,
} from '@/styles/chartConfig';

interface MonthlyFlow {
  month: string;
  contributions: number;
  expenses: number;
}

export default function ContributionsVsExpenses({ data }: { data: MonthlyFlow[] }) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Contributions vs Expenses
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.contribution} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.contribution} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="month" tick={CHART_TICK} />
            <YAxis tickFormatter={formatAxis} tick={CHART_TICK} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL}
              itemStyle={CHART_TOOLTIP_ITEM}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="contributions"
              name="Contributions"
              stroke={CHART_COLORS.contribution}
              fill="url(#colorContrib)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={CHART_COLORS.expense}
              fill="url(#colorExpense)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
