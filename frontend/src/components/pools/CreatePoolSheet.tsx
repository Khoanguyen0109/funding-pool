import { useState } from 'react';
import {
  TextField, Button, Stack, ToggleButtonGroup, ToggleButton,
  Typography, Box, CircularProgress, MenuItem,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import BottomSheet from '@/components/common/BottomSheet';
import { useCreatePoolMutation } from '@/store/api/poolsApi';
import { CURRENCIES } from '@/utils/currency';

const POOL_COLORS = ['#E91E8C', '#A855F7', '#34D399', '#60A5FA', '#FBBF24', '#F87171'];
const POOL_ICONS = ['💰', '🏠', '✈️', '🎓', '🏥', '🎉', '🛒', '💼'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreatePoolSheet({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'private' | 'shared'>('private');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState(POOL_COLORS[0] ?? '#E91E8C');
  const [currency, setCurrency] = useState('VND');
  const [createPool, { isLoading }] = useCreatePoolMutation();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await createPool({ name: name.trim(), description: description.trim() || '', type, icon, color, currency }).unwrap();
      resetAndClose();
    } catch {
      // RTK Query will surface the error via the hook if needed
    }
  };

  const resetAndClose = () => {
    setName('');
    setDescription('');
    setType('private');
    setIcon('💰');
    setColor(POOL_COLORS[0] ?? '#E91E8C');
    setCurrency('VND');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={resetAndClose} title="Create New Pool">
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <TextField
          label="Pool Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
          required
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <TextField
          label="Currency"
          select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          fullWidth
        >
          {CURRENCIES.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Type</Typography>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, v) => v && setType(v)}
            fullWidth
            size="small"
          >
            <ToggleButton value="private">
              <LockIcon sx={{ mr: 0.5, fontSize: 18 }} /> Private
            </ToggleButton>
            <ToggleButton value="shared">
              <GroupIcon sx={{ mr: 0.5, fontSize: 18 }} /> Shared
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Icon</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {POOL_ICONS.map((ic) => (
              <Box
                key={ic}
                onClick={() => setIcon(ic)}
                sx={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 1, cursor: 'pointer', fontSize: 22,
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
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Color</Typography>
          <Stack direction="row" spacing={1}>
            {POOL_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setColor(c)}
                sx={{
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                  bgcolor: c,
                  border: color === c ? '3px solid white' : '3px solid transparent',
                  boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                }}
              />
            ))}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={resetAndClose} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim() || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            Create Pool
          </Button>
        </Stack>
      </Stack>
    </BottomSheet>
  );
}
