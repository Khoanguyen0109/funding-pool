import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
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

interface CategoryBudget {
  name: string;
  budget: number;
  spent: number;
  remaining: number;
}

export default function BudgetVsActual({ data }: { data: CategoryBudget[] }) {
  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Budget vs Actual Spending
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis type="number" tickFormatter={formatChartAxis} tick={CHART_TICK} />
            <YAxis dataKey="name" type="category" width={90} tick={CHART_TICK} />
            <Tooltip
              formatter={(value) => formatChartCurrency(Number(value))}
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL}
              itemStyle={CHART_TOOLTIP_ITEM}
            />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill={CHART_COLORS.budget} radius={[0, 4, 4, 0]} barSize={14} />
            <Bar dataKey="spent" name="Spent" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.remaining < 0 ? CHART_COLORS.budgetOver : CHART_COLORS.budgetSpent}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
