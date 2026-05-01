import { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, MenuItem, Typography, InputAdornment } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreateExpenseMutation } from '@/store/api/expensesApi';
import { getCurrencySymbol, formatCurrencyInput } from '@/utils/currency';
import type { Category } from '@/types';

interface Props {
  poolId: string;
  currency: string;
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

export default function AddExpenseSheet({ poolId, currency, categories, open, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0 || !description.trim() || !categoryId) return;
    try {
      await createExpense({ poolId, amount: parsed, description: description.trim(), categoryId, transactionDate: date || undefined }).unwrap();
      reset();
    } catch {
      // error surfaced via hook
    }
  };

  const handleAmountChange = (value: string) => {
    const { display, raw } = formatCurrencyInput(value);
    setDisplayAmount(display);
    setAmount(raw);
  };

  const reset = () => {
    setAmount('');
    setDisplayAmount('');
    setDescription('');
    setCategoryId('');
    setDate(new Date().toISOString().slice(0, 10));
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={reset} title="Log Expense">
      <Stack spacing={2} sx={{ mt: 1 }}>
        {categories.length === 0 ? (
          <Typography variant="body2" color="warning.main">
            Add a category first before logging expenses.
          </Typography>
        ) : (
          <>
            <TextField
              label="Category"
              select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              fullWidth
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amount"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              fullWidth
              required
              slotProps={{
                htmlInput: { inputMode: 'decimal' },
                input: {
                  startAdornment: <InputAdornment position="start">{getCurrencySymbol(currency)}</InputAdornment>,
                  endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
                },
              }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </>
        )}
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={reset} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={categories.length === 0 || !amount || !description.trim() || !categoryId || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Log Expense
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
