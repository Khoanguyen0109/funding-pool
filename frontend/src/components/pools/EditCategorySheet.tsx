import { useState, useEffect } from 'react';
import { TextField, Button, Stack, CircularProgress, Box, Typography, InputAdornment, Alert } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useUpdateCategoryMutation } from '@/store/api/categoriesApi';
import { getCurrencySymbol } from '@/utils/currency';
import type { Category } from '@/types';

const CATEGORY_ICONS = ['📁', '🍔', '🚗', '🏠', '💊', '🎮', '📚', '✈️', '🛍️', '💡', '📱', '🎵'];

interface Props {
  poolId: string;
  currency: string;
  category: Category | null;
  open: boolean;
  onClose: () => void;
}

export default function EditCategorySheet({ poolId, currency, category, open, onClose }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setBudgetAmount(String(category.budgetAmount));
      setError(null);
    }
  }, [category]);

  const handleSubmit = async () => {
    const parsed = parseFloat(budgetAmount);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    setError(null);
    try {
      await updateCategory({ poolId, categoryId: category!.id, name: name.trim(), icon, budgetAmount: parsed }).unwrap();
      onClose();
    } catch (err: unknown) {
      const data = err as { data?: { message?: string | string[] } };
      const m = data?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : (typeof m === 'string' ? m : 'Could not save changes'));
    }
  };

  const isValid = name.trim().length > 0 && budgetAmount !== '' && !isNaN(parseFloat(budgetAmount)) && parseFloat(budgetAmount) >= 0;

  return (
    <BottomSheet open={open} onClose={() => !isLoading && onClose()} title="Edit Category">
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
          required
        />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Icon</Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {CATEGORY_ICONS.map((ic) => (
              <Box
                key={ic}
                onClick={() => setIcon(ic)}
                sx={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 1, cursor: 'pointer', fontSize: 20,
                  border: icon === ic ? '2px solid' : '1px solid transparent',
                  borderColor: icon === ic ? 'primary.main' : 'transparent',
                  bgcolor: icon === ic ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {ic}
              </Box>
            ))}
          </Stack>
        </Box>
        <TextField
          label="Budget Amount"
          type="number"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          fullWidth
          required
          slotProps={{
            htmlInput: { min: 0, step: 0.01 },
            input: {
              startAdornment: <InputAdornment position="start">{getCurrencySymbol(currency)}</InputAdornment>,
              endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
            },
          }}
        />
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        )}
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onClose} color="inherit" disabled={isLoading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isValid || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
