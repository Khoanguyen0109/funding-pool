import { useMemo } from 'react';
import {
  Box, Typography, TextField, Button, Stack, CircularProgress, Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import {
  useGetInvitesQuery,
  useCreateInviteMutation,
  useRevokeInviteMutation,
} from '@/store/api/invitesApi';

interface Props {
  poolId: string;
}

export default function ShareLinkTab({ poolId }: Props) {
  const { data: invites = [], isLoading } = useGetInvitesQuery(poolId);
  const [createInvite, { isLoading: isCreating }] = useCreateInviteMutation();
  const [revokeInvite] = useRevokeInviteMutation();
  const [copied, setCopied] = useState(false);

  const linkInvite = useMemo(
    () => invites.find((inv) => inv.type === 'link'),
    [invites],
  );

  const inviteUrl = linkInvite
    ? `${window.location.origin}/join/${linkInvite.token}`
    : '';

  const daysLeft = linkInvite
    ? Math.max(0, Math.ceil((new Date(linkInvite.expiresAt).getTime() - Date.now()) / 86400000))
    : 0;

  const handleGenerate = async () => {
    await createInvite({ poolId, type: 'link' }).unwrap();
  };

  const handleRegenerate = async () => {
    if (linkInvite) {
      await revokeInvite({ poolId, inviteId: linkInvite.id }).unwrap();
    }
    await createInvite({ poolId, type: 'link' }).unwrap();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!linkInvite) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generate a shareable link so anyone with the link can request to join this pool.
        </Typography>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={isCreating}
          startIcon={isCreating ? <CircularProgress size={16} /> : undefined}
        >
          Generate Invite Link
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Share this link. Anyone with it can request to join your pool.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          value={inviteUrl}
          size="small"
          fullWidth
          slotProps={{ input: { readOnly: true, sx: { fontSize: 13 } } }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleCopy}
          startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          color={copied ? 'success' : 'primary'}
          sx={{ minWidth: 100, whiteSpace: 'nowrap' }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Chip
          label={`Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11 }}
        />
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRegenerate}
          color="inherit"
        >
          Regenerate
        </Button>
      </Stack>
    </Stack>
  );
}
