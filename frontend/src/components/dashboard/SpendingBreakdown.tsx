import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CHART_TOOLTIP_STYLE,
  CHART_TOOLTIP_LABEL,
  CHART_TOOLTIP_ITEM,
  formatCurrency,
} from '@/styles/chartConfig';

interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

export default function SpendingBreakdown({ data }: { data: SpendingCategory[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Spending by Category
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <ResponsiveContainer width="100%" height={240} minWidth={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={CHART_TOOLTIP_STYLE}
                labelStyle={CHART_TOOLTIP_LABEL}
                itemStyle={CHART_TOOLTIP_ITEM}
              />
            </PieChart>
          </ResponsiveContainer>

          <Stack spacing={1} sx={{ minWidth: 160 }}>
            {data.map((d) => (
              <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  {d.name}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {((d.value / total) * 100).toFixed(0)}%
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
