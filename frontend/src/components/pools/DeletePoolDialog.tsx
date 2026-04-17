import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress, LinearProgress, Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDeletePoolMutation } from '@/store/api/poolsApi';

const COUNTDOWN_SECONDS = 5;

interface Props {
  poolId: string;
  poolName: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeletePoolDialog({ poolId, poolName, open, onClose, onDeleted }: Props) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [deletePool, { isLoading }] = useDeletePoolMutation();

  useEffect(() => {
    if (!open) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }

    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, countdown]);

  const handleDelete = useCallback(async () => {
    try {
      await deletePool(poolId).unwrap();
      onDeleted();
    } catch {
      // error surfaced via hook
    }
  }, [deletePool, poolId, onDeleted]);

  const enabled = countdown <= 0 && !isLoading;
  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: 'error.main' }}>
        <WarningAmberIcon /> Delete Pool
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete <strong>{poolName}</strong>? This will permanently remove all categories, contributions, expenses, and members.
        </Typography>
        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600, mb: 2 }}>
          This action cannot be undone.
        </Typography>

        {countdown > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Confirm button enables in {countdown}s...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              color="error"
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={!enabled}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {countdown > 0 ? `Delete (${countdown}s)` : 'Delete Pool'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
