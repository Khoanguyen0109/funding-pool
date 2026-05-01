import { useMemo } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
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
  formatChartCurrency,
  formatChartAxis,
} from '@/styles/chartConfig';
import { useLocale } from '@/context/LocaleContext';
import { formatDashboardMonth } from '@/utils/dateDisplay';

interface TrendData {
  month: string;
  balance: number;
  savings: number;
}

export default function MonthlyTrends({ data }: { data: TrendData[] }) {
  const { locale } = useLocale();
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        monthLabel: formatDashboardMonth(row.month),
      })),
    [data, locale],
  );

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Monthly Balance & Savings Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="monthLabel" tick={CHART_TICK} />
            <YAxis yAxisId="left" tickFormatter={formatChartAxis} tick={CHART_TICK} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatChartAxis} tick={CHART_TICK} />
            <Tooltip
              formatter={(value) => formatChartCurrency(Number(value))}
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL}
              itemStyle={CHART_TOOLTIP_ITEM}
            />
            <Legend />
            <Bar
              yAxisId="right"
              dataKey="savings"
              name="Monthly Savings"
              fill={CHART_COLORS.savings}
              radius={[4, 4, 0, 0]}
              barSize={28}
              opacity={0.7}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="balance"
              name="Running Balance"
              stroke={CHART_COLORS.balance}
              strokeWidth={2.5}
              dot={{ fill: CHART_COLORS.balance, r: 4, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
