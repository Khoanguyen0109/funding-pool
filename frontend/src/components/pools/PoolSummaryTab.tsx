import { useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Avatar, LinearProgress, Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import {
  CHART_GRID, CHART_TICK, CHART_TOOLTIP_STYLE,
  CHART_TOOLTIP_LABEL, CHART_TOOLTIP_ITEM, CHART_COLORS,
} from '@/styles/chartConfig';
import { formatMoney } from '@/utils/currency';
import type { Transaction, Category } from '@/types';

const PIE_COLORS = [
  '#6C5CE7', '#00B894', '#E17055', '#0984E3', '#FDCB6E',
  '#E84393', '#00CEC9', '#D63031', '#6AB04C', '#F78FB3',
];

interface Props {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  poolColor: string;
  memberCount: number;
}

export default function PoolSummaryTab({ transactions, categories, currency, poolColor, memberCount }: Props) {
  const incomes = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

  const fmtTooltip = (value?: number | string | readonly (number | string)[]) => formatMoney(Number(value ?? 0), currency);
  const fmtAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toString();
  };

  const memberBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; income: number; expense: number }>();
    for (const tx of transactions) {
      const entry = map.get(tx.user.id) ?? { name: tx.user.name, income: 0, expense: 0 };
      if (tx.type === 'income') entry.income += tx.amount;
      else entry.expense += tx.amount;
      map.set(tx.user.id, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.income - a.income);
  }, [transactions]);

  const categorySpending = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of expenses) {
      if (tx.category) {
        map.set(tx.category.id, (map.get(tx.category.id) ?? 0) + tx.amount);
      }
    }
    return categories.map((cat, i) => ({
      name: `${cat.icon} ${cat.name}`,
      budget: Number(cat.budgetAmount),
      spent: map.get(cat.id) ?? 0,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [expenses, categories]);

  const pieData = categorySpending
    .filter((c) => c.spent > 0)
    .map((c) => ({ name: c.name, value: c.spent, color: c.color }));

  const totalBudget = categorySpending.reduce((s, c) => s + c.budget, 0);
  const totalSpent = categorySpending.reduce((s, c) => s + c.spent, 0);

  const monthlyFlow = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
      const d = new Date(tx.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = map.get(key) ?? { income: 0, expense: 0 };
      if (tx.type === 'income') entry.income += tx.amount;
      else entry.expense += tx.amount;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }));
  }, [transactions]);

  const balanceOverTime = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    let running = 0;
    const points: { date: string; balance: number }[] = [];
    for (const tx of sorted) {
      running += tx.type === 'income' ? tx.amount : -tx.amount;
      points.push({
        date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: running,
      });
    }
    if (points.length > 30) {
      const step = Math.ceil(points.length / 30);
      return points.filter((_, i) => i % step === 0 || i === points.length - 1);
    }
    return points;
  }, [transactions]);

  if (transactions.length === 0 && categories.length === 0) {
    return (
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No data yet. Add income or expenses to see the pool summary.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Quick stats row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
        {[
          { label: 'Transactions', value: transactions.length.toString() },
          { label: 'Members', value: memberCount.toString() },
          { label: 'Categories', value: categories.length.toString() },
          { label: 'Budget Used', value: totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '—' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts row 1: Income vs Expenses + Running Balance */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
        {/* Income vs Expenses (monthly area chart) */}
        {monthlyFlow.length > 0 && (
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Income vs Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyFlow} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="poolGradIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.contribution} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.contribution} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="poolGradExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_GRID} />
                  <XAxis dataKey="month" tick={CHART_TICK} />
                  <YAxis tickFormatter={fmtAxis} tick={CHART_TICK} />
                  <Tooltip
                    formatter={fmtTooltip}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelStyle={CHART_TOOLTIP_LABEL}
                    itemStyle={CHART_TOOLTIP_ITEM}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke={CHART_COLORS.contribution}
                    fill="url(#poolGradIncome)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke={CHART_COLORS.expense}
                    fill="url(#poolGradExpense)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Running Balance (line chart) */}
        {balanceOverTime.length > 1 && (
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Balance Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={balanceOverTime} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="poolGradBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={poolColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={poolColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...CHART_GRID} />
                  <XAxis dataKey="date" tick={CHART_TICK} />
                  <YAxis tickFormatter={fmtAxis} tick={CHART_TICK} />
                  <Tooltip
                    formatter={fmtTooltip}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelStyle={CHART_TOOLTIP_LABEL}
                    itemStyle={CHART_TOOLTIP_ITEM}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke={poolColor}
                    fill="url(#poolGradBalance)"
                    strokeWidth={2.5}
                    dot={{ fill: poolColor, r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Charts row 2: Monthly Net + Spending by Category */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
        {/* Monthly Net (bar chart) */}
        {monthlyFlow.length > 0 && (
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Monthly Net Savings
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyFlow} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid {...CHART_GRID} />
                  <XAxis dataKey="month" tick={CHART_TICK} />
                  <YAxis tickFormatter={fmtAxis} tick={CHART_TICK} />
                  <Tooltip
                    formatter={fmtTooltip}
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelStyle={CHART_TOOLTIP_LABEL}
                    itemStyle={CHART_TOOLTIP_ITEM}
                  />
                  <Bar
                    dataKey="net"
                    name="Net"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  >
                    {monthlyFlow.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.net >= 0 ? CHART_COLORS.contribution : CHART_COLORS.expense}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pie chart: spending by category, or budget allocation, or income/expense split */}
        {(() => {
          const hasCategorySpending = pieData.length > 0;
          const hasBudgets = categorySpending.some((c) => c.budget > 0);
          const hasFlow = totalIncome > 0 || totalExpense > 0;

          const chartData = hasCategorySpending
            ? pieData
            : hasBudgets
              ? categorySpending.filter((c) => c.budget > 0).map((c) => ({ name: c.name, value: c.budget, color: c.color }))
              : hasFlow
                ? [
                    { name: 'Income', value: totalIncome, color: CHART_COLORS.contribution },
                    { name: 'Expenses', value: totalExpense, color: CHART_COLORS.expense },
                  ].filter((d) => d.value > 0)
                : [];

          const chartTitle = hasCategorySpending
            ? 'Spending by Category'
            : hasBudgets
              ? 'Budget Allocation'
              : 'Income vs Expenses';

          if (chartData.length === 0) return null;

          const chartTotal = chartData.reduce((s, d) => s + d.value, 0);

          return (
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  {chartTitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <ResponsiveContainer width="100%" height={240} minWidth={180}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={fmtTooltip}
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelStyle={CHART_TOOLTIP_LABEL}
                        itemStyle={CHART_TOOLTIP_ITEM}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={0.75} sx={{ minWidth: 140 }}>
                    {chartData.map((d) => (
                      <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }} noWrap>
                          {d.name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {((d.value / chartTotal) * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })()}
      </Box>

      {/* Budget vs Actual (horizontal bar chart) */}
      {categorySpending.length > 0 && (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Budget vs Actual
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {formatMoney(totalSpent, currency)} spent of {formatMoney(totalBudget, currency)} budget
            </Typography>
            <ResponsiveContainer width="100%" height={Math.max(categorySpending.length * 50, 120)}>
              <BarChart
                data={categorySpending}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid {...CHART_GRID} />
                <XAxis type="number" tickFormatter={fmtAxis} tick={CHART_TICK} />
                <YAxis dataKey="name" type="category" width={100} tick={CHART_TICK} />
                <Tooltip
                  formatter={fmtTooltip}
                  contentStyle={CHART_TOOLTIP_STYLE}
                  labelStyle={CHART_TOOLTIP_LABEL}
                  itemStyle={CHART_TOOLTIP_ITEM}
                />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill={CHART_COLORS.budget} radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="spent" name="Spent" radius={[0, 4, 4, 0]} barSize={14}>
                  {categorySpending.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.spent > entry.budget ? CHART_COLORS.budgetOver : CHART_COLORS.budgetSpent}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bottom row: Member contributions + Recent Activity */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
        {/* Member contributions */}
        {memberBreakdown.length > 0 && (
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Member Contributions
              </Typography>
              <Stack spacing={1.5}>
                {memberBreakdown.map((m) => {
                  const pct = totalIncome > 0 ? (m.income / totalIncome) * 100 : 0;
                  return (
                    <Box key={m.name}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: alpha(poolColor, 0.3) }}>
                            {m.name[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.name}</Typography>
                        </Stack>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          {formatMoney(m.income, currency)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(poolColor, 0.1),
                          '& .MuiLinearProgress-bar': { bgcolor: poolColor, borderRadius: 3 },
                        }}
                      />
                      {m.expense > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                          Spent: {formatMoney(m.expense, currency)}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Recent activity */}
        {transactions.length > 0 && (
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Recent Activity
              </Typography>
              {transactions.slice(0, 5).map((tx, i) => (
                <Box key={tx.id}>
                  {i > 0 && <Divider sx={{ my: 1 }} />}
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {tx.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tx.user.name} · {new Date(tx.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, ml: 2, color: tx.type === 'income' ? 'success.main' : 'error.main' }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, currency)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
