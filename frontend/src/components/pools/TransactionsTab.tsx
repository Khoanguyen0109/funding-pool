import { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Divider, TextField, MenuItem,
  ToggleButtonGroup, ToggleButton, Chip, IconButton, Button, Alert, Badge,
} from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { alpha, useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import { formatMoney } from '@/utils/currency';
import type { Transaction, Category } from '@/types';
import { useDeleteTransactionMutation } from '@/store/api/transactionsApi';

type GroupBy = 'none' | 'daily' | 'monthly';
type TypeFilter = 'all' | 'income' | 'expense';

interface Props {
  poolId: string;
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

export default function TransactionsTab({ poolId, transactions, categories, currency }: Props) {
  const theme = useTheme();

  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

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

  const activeFilterCount = (categoryFilter !== 'all' ? 1 : 0) + (dateFrom || dateTo ? 1 : 0) + (groupBy !== 'none' ? 1 : 0);

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
    setGroupBy('none');
  };

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

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteError(null);
    try {
      await deleteTransaction({
        poolId,
        transactionId: pendingDelete.id,
        type: pendingDelete.type,
      }).unwrap();
      setPendingDelete(null);
    } catch (err: unknown) {
      const data = err as { data?: { message?: string | string[] } };
      const m = data?.data?.message;
      setDeleteError(Array.isArray(m) ? m.join(', ') : (typeof m === 'string' ? m : 'Could not delete transaction'));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filters — top row */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={(_, v) => v && setTypeFilter(v)}
          size="small"
          sx={{ height: 32, flex: 1 }}
        >
          <ToggleButton value="all" sx={{ flex: 1, fontSize: 12 }}>All</ToggleButton>
          <ToggleButton value="income" sx={{ flex: 1, fontSize: 12, color: 'success.main' }}>Income</ToggleButton>
          <ToggleButton value="expense" sx={{ flex: 1, fontSize: 12, color: 'error.main' }}>Expense</ToggleButton>
        </ToggleButtonGroup>

        <IconButton
          size="small"
          onClick={() => setFilterSheetOpen(true)}
          sx={{
            border: 1,
            borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider',
            borderRadius: 1,
            width: 34,
            height: 32,
            flexShrink: 0,
          }}
          aria-label="Open filters"
        >
          <Badge badgeContent={activeFilterCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
            <FilterListIcon sx={{ fontSize: 18 }} />
          </Badge>
        </IconButton>
      </Stack>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {groupBy !== 'none' && (
            <Chip
              label={groupBy === 'daily' ? 'Group: Daily' : 'Group: Monthly'}
              size="small"
              onDelete={() => setGroupBy('none')}
              sx={{ fontSize: 11, height: 24 }}
            />
          )}
          {categoryFilter !== 'all' && (
            <Chip
              label={(() => { const c = usedCategories.find((c) => c.id === categoryFilter); return c ? `${c.icon} ${c.name}` : 'Category'; })()}
              size="small"
              onDelete={() => setCategoryFilter('all')}
              sx={{ fontSize: 11, height: 24 }}
            />
          )}
          {(dateFrom || dateTo) && (
            <Chip
              label={dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : dateFrom || dateTo}
              size="small"
              onDelete={() => { setDateFrom(''); setDateTo(''); }}
              sx={{ fontSize: 11, height: 24 }}
            />
          )}
        </Stack>
      )}

      {/* Filter bottom sheet */}
      <BottomSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title="Filters">
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Group by
            </Typography>
            <ToggleButtonGroup
              value={groupBy}
              exclusive
              onChange={(_, v) => v !== null && setGroupBy(v)}
              size="small"
              fullWidth
              sx={{ height: 36 }}
            >
              <ToggleButton value="none" sx={{ flex: 1, fontSize: 13 }}>List</ToggleButton>
              <ToggleButton value="daily" sx={{ flex: 1, fontSize: 13 }}>Daily</ToggleButton>
              <ToggleButton value="monthly" sx={{ flex: 1, fontSize: 13 }}>Monthly</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {usedCategories.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Category
              </Typography>
              <TextField
                select
                size="small"
                fullWidth
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {usedCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Date range
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                placeholder="From"
              />
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>—</Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                placeholder="To"
              />
            </Stack>
          </Box>

          <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1 }}>
            <Button size="small" color="inherit" onClick={clearAllFilters} disabled={activeFilterCount === 0}>
              Clear all
            </Button>
            <Button size="small" variant="contained" onClick={() => setFilterSheetOpen(false)}>
              Done
            </Button>
          </Stack>
        </Stack>
      </BottomSheet>

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
                      <IconButton
                        size="small"
                        aria-label="Delete transaction"
                        disabled={isDeleting}
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(tx);
                        }}
                        sx={{ color: 'text.secondary', flexShrink: 0 }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        ))
      )}

      <BottomSheet
        open={Boolean(pendingDelete)}
        onClose={() => !isDeleting && setPendingDelete(null)}
        title="Delete this transaction?"
      >
        {pendingDelete && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {pendingDelete.description}
              {' · '}
              {pendingDelete.type === 'income' ? '+' : '-'}
              {formatMoney(pendingDelete.amount, currency)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              It will be removed from balances and lists. This uses a soft delete on the server.
            </Typography>
            {deleteError && (
              <Alert severity="error" onClose={() => setDeleteError(null)}>
                {deleteError}
              </Alert>
            )}
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setPendingDelete(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </Stack>
          </Stack>
        )}
      </BottomSheet>
    </Box>
  );
}
