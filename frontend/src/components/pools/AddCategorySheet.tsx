import { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, Box, Typography, InputAdornment } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreateCategoryMutation } from '@/store/api/categoriesApi';
import { getCurrencySymbol } from '@/utils/currency';

const CATEGORY_ICONS = ['📁', '🍔', '🚗', '🏠', '💊', '🎮', '📚', '✈️', '🛍️', '💡', '📱', '🎵'];

interface Props {
  poolId: string;
  currency: string;
  open: boolean;
  onClose: () => void;
}

export default function AddCategorySheet({ poolId, currency, open, onClose }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleSubmit = async () => {
    const parsed = parseFloat(budgetAmount);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    try {
      await createCategory({ poolId, name: name.trim(), icon, budgetAmount: parsed }).unwrap();
      reset();
    } catch {
      // error surfaced via hook
    }
  };

  const reset = () => {
    setName('');
    setIcon('📁');
    setBudgetAmount('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={reset} title="Add Category">
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
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
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
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={reset} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim() || !budgetAmount || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Add Category
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
