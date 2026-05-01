import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Stack, Card, CardContent,
  Chip, Avatar, Divider, IconButton, Tab, Tabs, Menu, MenuItem, ListItemIcon, ListItemText,
  Alert, LinearProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';
import { useGetPoolQuery } from '@/store/api/poolsApi';
import { usePatchMeMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '@/store/api/categoriesApi';
import { useGetTransactionsQuery } from '@/store/api/transactionsApi';
import { useGetPendingMembersQuery } from '@/store/api/membersApi';
import { formatMoney } from '@/utils/currency';
import AddIncomeSheet from '@/components/pools/AddIncomeSheet';
import AddExpenseSheet from '@/components/pools/AddExpenseSheet';
import AddCategorySheet from '@/components/pools/AddCategorySheet';
import EditCategorySheet from '@/components/pools/EditCategorySheet';
import DeletePoolSheet from '@/components/pools/DeletePoolSheet';
import SharePoolSheet from '@/components/pools/SharePoolSheet';
import BottomSheet from '@/components/common/BottomSheet';
import PendingMembersSection from '@/components/pools/PendingMembersSection';
import PoolSummaryTab from '@/components/pools/PoolSummaryTab';
import TransactionsTab from '@/components/pools/TransactionsTab';

export default function PoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: pool, isLoading } = useGetPoolQuery(id!);
  const { data: categories = [] } = useGetCategoriesQuery(id!);
  const { data: transactions = [] } = useGetTransactionsQuery(id!);
  const { data: pendingMembers = [] } = useGetPendingMembersQuery(id!);

  const [tab, setTab] = useState(0);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [editCategoryTarget, setEditCategoryTarget] = useState<import('@/types').Category | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<import('@/types').Category | null>(null);
  const [deleteCategoryError, setDeleteCategoryError] = useState<string | null>(null);
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();

  const user = useAppSelector((s) => s.auth.user);
  const defaultPoolId = user?.defaultPoolId ?? null;
  const [patchMe] = usePatchMeMutation();
  const isDefaultPool = defaultPoolId === id;

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.category) {
        map.set(tx.category.id, (map.get(tx.category.id) ?? 0) + tx.amount);
      }
    }
    return map;
  }, [transactions]);

  if (isLoading || !pool) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isPoolOwner =
    !!user &&
    (pool.ownerId === user.id ||
      (pool.members ?? []).some((m) => m.userId === user.id && m.role === 'owner'));

  const poolCurrency = pool.currency || 'VND';

  const totalContributions = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalContributions - totalExpenses;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Back nav */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0.5}>
          <IconButton
            onClick={() => navigate('/dashboard')}
            size="small"
            sx={{ color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.text.secondary, 0.08) } }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            Dashboard
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => setShareOpen(true)}
            sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
          >
            <ShareRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.text.secondary, 0.08) } }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { bgcolor: 'background.paper', minWidth: 160 } } }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              patchMe({ defaultPoolId: isDefaultPool ? null : id! });
            }}
          >
            <ListItemIcon>
              {isDefaultPool ? (
                <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
              ) : (
                <StarBorderIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{isDefaultPool ? 'Clear default pool' : 'Set as default pool'}</ListItemText>
          </MenuItem>
          {isPoolOwner && (
            <MenuItem onClick={() => { setMenuAnchor(null); setDeleteOpen(true); }} sx={{ color: 'error.main' }}>
              <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
              <ListItemText>Delete Pool</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Stack>

      {/* Hero card */}
      <Card sx={{ borderTop: `3px solid ${pool.color}` }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Pool identity */}
          <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                bgcolor: alpha(pool.color, 0.15),
              }}
            >
              {pool.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{pool.name}</Typography>
                <Chip
                  label={pool.type}
                  size="small"
                  sx={{
                    textTransform: 'capitalize', height: 18, fontSize: 10,
                    bgcolor: alpha(pool.color, 0.15), color: pool.color, fontWeight: 600,
                  }}
                />
              </Stack>
              {pool.description && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {pool.description}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Stats row — always 3 columns */}
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Balance</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', lineHeight: 1.4 }}>{formatMoney(balance, poolCurrency)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Income</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', lineHeight: 1.4, color: 'success.main' }}>{formatMoney(totalContributions, poolCurrency)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Expenses</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', lineHeight: 1.4, color: 'error.main' }}>{formatMoney(totalExpenses, poolCurrency)}</Typography>
            </Box>
          </Box>

          {/* Spend ratio progress bar */}
          {totalContributions > 0 && (() => {
            const pct = Math.min((totalExpenses / totalContributions) * 100, 100);
            const isOver = totalExpenses > totalContributions;
            const isWarning = !isOver && pct >= 80;
            const barColor = isOver ? 'error.main' : isWarning ? 'warning.main' : 'success.main';
            const label = isOver
              ? `Over by ${formatMoney(totalExpenses - totalContributions, poolCurrency)}`
              : `${pct.toFixed(0)}% spent`;
            return (
              <Box sx={{ mt: 1.25 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Spending</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isOver ? 'error.main' : isWarning ? 'warning.main' : 'success.main' }}>
                    {label}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 5, borderRadius: 3,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: barColor },
                  }}
                />
              </Box>
            );
          })()}

          {/* Action buttons */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              fullWidth variant="contained" color="success"
              startIcon={<TrendingUpIcon sx={{ fontSize: '1rem' }} />}
              onClick={() => setIncomeOpen(true)}
              size="small"
              sx={{ fontSize: '0.75rem', py: 0.75, textTransform: 'none' }}
            >
              Add Income
            </Button>
            <Button
              fullWidth variant="outlined" color="error"
              startIcon={<TrendingDownIcon sx={{ fontSize: '1rem' }} />}
              onClick={() => setExpenseOpen(true)}
              size="small"
              sx={{ fontSize: '0.75rem', py: 0.75, textTransform: 'none' }}
            >
              Log Expense
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.75rem', py: 0.75, px: 1.5 } }}
      >
        <Tab label="Summary" />
        <Tab label="Transactions" />
        <Tab label={`Categories (${categories.length})`} />
        <Tab label={`Members (${pool.members?.length ?? 0})${pendingMembers.length > 0 ? ` ·${pendingMembers.length}` : ''}`} />
      </Tabs>

      {/* Tab: Summary */}
      {tab === 0 && (
        <PoolSummaryTab
          transactions={transactions}
          categories={categories}
          currency={poolCurrency}
          poolColor={pool.color}
          memberCount={pool.members?.length ?? 0}
        />
      )}

      {/* Tab: Transactions */}
      {tab === 1 && (
        <TransactionsTab poolId={id!} transactions={transactions} categories={categories} currency={poolCurrency} />
      )}

      {/* Tab: Categories */}
      {tab === 2 && (
        <Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCategoryOpen(true)}
            sx={{ mb: 2 }}
          >
            Add Category
          </Button>
          {categories.length === 0 ? (
            <Typography color="text.secondary">No categories yet. Add one to organize expenses.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {categories.map((cat) => {
                const spent = spentByCategory.get(cat.id) ?? 0;
                const budget = Number(cat.budgetAmount);
                const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                const isOver = spent > budget;
                const isWarning = !isOver && pct >= 80;
                const barColor = isOver ? 'error.main' : isWarning ? 'warning.main' : 'success.main';
                const remaining = budget - spent;
                return (
                  <Card key={cat.id} sx={isOver ? { borderLeft: '3px solid', borderColor: 'error.main' } : undefined}>
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontSize: 20 }}>{cat.icon}</Typography>
                        <Typography variant="subtitle2" sx={{ flex: 1 }}>{cat.name}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => setEditCategoryTarget(cat)}
                          sx={{ color: 'text.secondary' }}
                          aria-label={`Edit ${cat.name}`}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => { setDeleteCategoryError(null); setDeleteCategoryTarget(cat); }}
                          sx={{ color: 'text.secondary' }}
                          aria-label={`Delete ${cat.name}`}
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>

                      {/* Progress bar */}
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6, borderRadius: 3, mb: 1,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: barColor },
                        }}
                      />

                      {/* Spent / Budget row */}
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatMoney(spent, poolCurrency)} spent
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: isOver ? 'error.main' : 'text.secondary' }}>
                          {isOver
                            ? `${formatMoney(Math.abs(remaining), poolCurrency)} over`
                            : `${formatMoney(remaining, poolCurrency)} left`}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Budget: {formatMoney(budget, poolCurrency)}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Tab: Members */}
      {tab === 3 && (
        <>
        <PendingMembersSection poolId={id!} poolColor={pool.color} />
        <Card>
          <CardContent sx={{ p: 0 }}>
            {(pool.members ?? []).map((m, i) => (
              <Box key={m.id}>
                {i > 0 && <Divider />}
                <Stack direction="row" sx={{ alignItems: 'center', px: 2.5, py: 1.5 }} spacing={2}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(pool.color, 0.3), fontSize: 14 }}>
                    {m.user?.name?.[0] ?? <GroupIcon sx={{ fontSize: 16 }} />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {m.user?.name ?? 'Unknown'}
                    </Typography>
                  </Box>
                  <Chip label={m.role} size="small" variant="outlined" sx={{ textTransform: 'capitalize', fontSize: 11 }} />
                </Stack>
              </Box>
            ))}
          </CardContent>
        </Card>
        </>
      )}

      {/* Sheets */}
      <AddIncomeSheet poolId={id!} currency={poolCurrency} open={incomeOpen} onClose={() => setIncomeOpen(false)} />
      <AddExpenseSheet poolId={id!} currency={poolCurrency} categories={categories} open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <AddCategorySheet poolId={id!} currency={poolCurrency} open={categoryOpen} onClose={() => setCategoryOpen(false)} />
      <EditCategorySheet
        poolId={id!}
        currency={poolCurrency}
        category={editCategoryTarget}
        open={Boolean(editCategoryTarget)}
        onClose={() => setEditCategoryTarget(null)}
      />

      {/* Delete category confirm sheet */}
      <BottomSheet
        open={Boolean(deleteCategoryTarget)}
        onClose={() => !isDeletingCategory && setDeleteCategoryTarget(null)}
        title="Delete category?"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {deleteCategoryTarget && (
            <Typography variant="body2" color="text.secondary">
              <strong>{deleteCategoryTarget.icon} {deleteCategoryTarget.name}</strong> will be removed from
              the category list and budget view. Past transactions already logged under this
              category are preserved — they will still appear in the transaction history.
            </Typography>
          )}
          {deleteCategoryError && (
            <Alert severity="error" onClose={() => setDeleteCategoryError(null)}>
              {deleteCategoryError}
            </Alert>
          )}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              onClick={() => setDeleteCategoryTarget(null)}
              color="inherit"
              disabled={isDeletingCategory}
            >
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={isDeletingCategory}
              startIcon={isDeletingCategory ? <CircularProgress size={16} /> : undefined}
              onClick={async () => {
                if (!deleteCategoryTarget) return;
                setDeleteCategoryError(null);
                try {
                  await deleteCategory({ poolId: id!, categoryId: deleteCategoryTarget.id }).unwrap();
                  setDeleteCategoryTarget(null);
                } catch (err: unknown) {
                  const data = err as { data?: { message?: string | string[] } };
                  const m = data?.data?.message;
                  setDeleteCategoryError(
                    Array.isArray(m) ? m.join(', ') : (typeof m === 'string' ? m : 'Could not delete category'),
                  );
                }
              }}
            >
              {isDeletingCategory ? 'Deleting…' : 'Delete'}
            </Button>
          </Stack>
        </Stack>
      </BottomSheet>
      <DeletePoolSheet
        poolId={id!}
        poolName={pool.name}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => navigate('/dashboard')}
      />
      <SharePoolSheet
        poolId={id!}
        poolName={pool.name}
        members={pool.members ?? []}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </Box>
  );
}
