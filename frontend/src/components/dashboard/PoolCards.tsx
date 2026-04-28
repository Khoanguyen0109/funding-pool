import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, LinearProgress, Stack, Chip, IconButton, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { formatMoney } from '@/utils/currency';
import { usePatchMeMutation } from '@/store/api/authApi';

interface PoolSummary {
  id: string;
  name: string;
  color: string;
  icon: string;
  currency?: string;
  balance: number;
  totalBudget?: number;
  totalSpent?: number;
  memberCount?: number;
}

interface PoolCardsProps {
  pools: PoolSummary[];
  loading?: boolean;
  defaultPoolId?: string | null;
}

export default function PoolCards({ pools, loading, defaultPoolId = null }: PoolCardsProps) {
  const navigate = useNavigate();
  const [patchMe, { isLoading: patching }] = usePatchMeMutation();

  const handleDefaultClick = (e: React.MouseEvent, poolId: string) => {
    e.stopPropagation();
    const next = defaultPoolId === poolId ? null : poolId;
    patchMe({ defaultPoolId: next });
  };

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading pools...
      </Typography>
    );
  }

  if (pools.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No pools yet. Create your first pool to get started.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {pools.map((pool) => {
        const currency = pool.currency || 'VND';
        const totalBudget = pool.totalBudget ?? 0;
        const totalSpent = pool.totalSpent ?? 0;
        const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
        const overBudget = totalSpent > totalBudget;

        return (
          <Card
            key={pool.id}
            onClick={() => navigate(`/pools/${pool.id}`)}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.common.black, 0.4)}` },
              borderTop: `3px solid ${pool.color}`,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: 24 }}>{pool.icon}</Typography>
                  <Typography variant="subtitle1">{pool.name}</Typography>
                </Stack>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
                  <Tooltip title={defaultPoolId === pool.id ? 'Default pool (click to clear)' : 'Set as default pool'}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={patching}
                        onClick={(e) => handleDefaultClick(e, pool.id)}
                        sx={{ color: defaultPoolId === pool.id ? 'warning.main' : 'text.disabled' }}
                        aria-label={defaultPoolId === pool.id ? 'Clear default pool' : 'Set as default pool'}
                      >
                        {defaultPoolId === pool.id ? (
                          <StarIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <StarBorderIcon sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  {pool.memberCount != null && (
                    <Chip
                      icon={<GroupIcon sx={{ fontSize: 14 }} />}
                      label={pool.memberCount}
                      size="small"
                      variant="outlined"
                      sx={{ height: 24, fontSize: 12 }}
                    />
                  )}
                </Stack>
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formatMoney(pool.balance, currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Balance
              </Typography>

              {totalBudget > 0 && (
                <Box sx={{ mb: 0.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatMoney(totalSpent, currency)} spent
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatMoney(totalBudget, currency)} budget
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: overBudget ? 'error.main' : pool.color,
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
