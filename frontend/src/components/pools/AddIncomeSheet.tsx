import { useState } from 'react';
import { TextField, Button, Stack, CircularProgress, InputAdornment } from '@mui/material';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreateContributionMutation } from '@/store/api/contributionsApi';
import { getCurrencySymbol, formatCurrencyInput } from '@/utils/currency';

interface Props {
  poolId: string;
  currency: string;
  open: boolean;
  onClose: () => void;
}

export default function AddIncomeSheet({ poolId, currency, open, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [createContribution, { isLoading }] = useCreateContributionMutation();

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    try {
      await createContribution({ poolId, amount: parsed, note: note.trim() || undefined, transactionDate: date || undefined }).unwrap();
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
    setNote('');
    setDate(new Date().toISOString().slice(0, 10));
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={reset} title="Add Income">
      <Stack spacing={2} sx={{ mt: 1 }}>
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
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={reset} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Add Income
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
