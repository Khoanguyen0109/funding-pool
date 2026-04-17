import { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Divider, TextField, MenuItem,
  ToggleButtonGroup, ToggleButton, Chip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatMoney } from '@/utils/currency';
import type { Transaction, Category } from '@/types';

type GroupBy = 'none' | 'daily' | 'monthly';
type TypeFilter = 'all' | 'income' | 'expense';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

function getDateKey(dateStr: string, groupBy: GroupBy): string {
  const d = new Date(dateStr);
  if (groupBy === 'daily') return d.toISOString().slice(0, 10);
  if (groupBy === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return '';
}

function formatGroupLabel(key: string, groupBy: GroupBy): string {
  if (groupBy === 'daily') {
    return new Date(key + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (groupBy === 'monthly') {
    return new Date(key + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  return '';
}

export default function TransactionsTab({ transactions, categories, currency }: Props) {
  const theme = useTheme();

  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const filtered = useMemo(() => {
    let result = transactions;

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category?.id === categoryFilter);
    }

    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00');
      result = result.filter((t) => new Date(t.transactionDate || t.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      result = result.filter((t) => new Date(t.transactionDate || t.createdAt) <= to);
    }

    return result;
  }, [transactions, typeFilter, categoryFilter, dateFrom, dateTo]);

  const filteredIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const filteredExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '', label: '', items: filtered }];

    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const key = getDateKey(tx.transactionDate || tx.createdAt, groupBy);
      const arr = map.get(key) ?? [];
      arr.push(tx);
      map.set(key, arr);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => ({ key, label: formatGroupLabel(key, groupBy), items }));
  }, [filtered, groupBy]);

  const usedCategories = useMemo(() => {
    const ids = new Set(transactions.filter((t) => t.category).map((t) => t.category!.id));
    return categories.filter((c) => ids.has(c.id));
  }, [transactions, categories]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={(_, v) => v && setTypeFilter(v)}
          size="small"
          sx={{ height: 32 }}
        >
          <ToggleButton value="all" sx={{ px: 1.5, fontSize: 12 }}>All</ToggleButton>
          <ToggleButton value="income" sx={{ px: 1.5, fontSize: 12, color: 'success.main' }}>Income</ToggleButton>
          <ToggleButton value="expense" sx={{ px: 1.5, fontSize: 12, color: 'error.main' }}>Expense</ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToggleButtonGroup
          value={groupBy}
          exclusive
          onChange={(_, v) => v !== null && setGroupBy(v)}
          size="small"
          sx={{ height: 32 }}
        >
          <ToggleButton value="none" sx={{ px: 1.5, fontSize: 12 }}>List</ToggleButton>
          <ToggleButton value="daily" sx={{ px: 1.5, fontSize: 12 }}>Daily</ToggleButton>
          <ToggleButton value="monthly" sx={{ px: 1.5, fontSize: 12 }}>Monthly</ToggleButton>
        </ToggleButtonGroup>

        {usedCategories.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <TextField
              select
              size="small"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ minWidth: 130, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {usedCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          <TextField
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 135, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
          />
          <Typography variant="caption" color="text.secondary">—</Typography>
          <TextField
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 135, '& .MuiInputBase-root': { height: 32, fontSize: 12 } }}
          />
          {(dateFrom !== today || dateTo !== today) && (
            <Chip
              label="Reset"
              size="small"
              onDelete={() => { setDateFrom(today); setDateTo(today); }}
              sx={{ fontSize: 11, height: 24 }}
            />
          )}
        </Box>
      </Box>

      {/* Summary bar */}
      <Stack direction="row" spacing={2}>
        <Chip
          label={`${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11 }}
        />
        {filteredIncome > 0 && (
          <Chip
            icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
            label={`+${formatMoney(filteredIncome, currency)}`}
            size="small"
            sx={{ fontSize: 11, color: 'success.main', borderColor: 'success.main' }}
            variant="outlined"
          />
        )}
        {filteredExpense > 0 && (
          <Chip
            icon={<TrendingDownIcon sx={{ fontSize: 14 }} />}
            label={`-${formatMoney(filteredExpense, currency)}`}
            size="small"
            sx={{ fontSize: 11, color: 'error.main', borderColor: 'error.main' }}
            variant="outlined"
          />
        )}
      </Stack>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {transactions.length === 0
                ? 'No transactions yet. Add income or log an expense.'
                : 'No transactions match the current filters.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => (
          <Box key={group.key || 'all'}>
            {group.label && (
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {group.label}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {(() => {
                    const gIncome = group.items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                    const gExpense = group.items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                    return (
                      <>
                        {gIncome > 0 && (
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                            +{formatMoney(gIncome, currency)}
                          </Typography>
                        )}
                        {gExpense > 0 && (
                          <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                            -{formatMoney(gExpense, currency)}
                          </Typography>
                        )}
                      </>
                    );
                  })()}
                </Stack>
              </Stack>
            )}
            <Card>
              <CardContent sx={{ p: 0 }}>
                {group.items.map((tx, i) => (
                  <Box key={tx.id}>
                    {i > 0 && <Divider />}
                    <Stack direction="row" sx={{ px: 2.5, py: 1.5, alignItems: 'center' }} spacing={2}>
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          bgcolor: tx.type === 'income'
                            ? alpha(theme.palette.success.main, 0.15)
                            : alpha(theme.palette.error.main, 0.15),
                        }}
                      >
                        {tx.type === 'income'
                          ? <TrendingUpIcon sx={{ fontSize: 18, color: 'success.main' }} />
                          : <TrendingDownIcon sx={{ fontSize: 18, color: 'error.main' }} />}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {tx.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tx.user.name} · {new Date(tx.transactionDate || tx.createdAt).toLocaleDateString()}
                          {tx.category && ` · ${tx.category.icon} ${tx.category.name}`}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: tx.type === 'income' ? 'success.main' : 'error.main' }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, currency)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        ))
      )}
    </Box>
  );
}
