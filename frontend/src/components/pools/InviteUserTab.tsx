import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Stack, Avatar, Button, Chip, CircularProgress,
  InputAdornment, List, ListItem, ListItemAvatar, ListItemText,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSearchUsersQuery } from '@/store/api/usersApi';
import { useGetInvitesQuery, useCreateInviteMutation } from '@/store/api/invitesApi';
import type { PoolMembership } from '@/types';

interface Props {
  poolId: string;
  members: PoolMembership[];
}

export default function InviteUserTab({ poolId, members }: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const trimmed = query.trim();
  const shouldSearch = trimmed.length >= 3;

  const { data: users = [], isFetching } = useSearchUsersQuery(trimmed, {
    skip: !shouldSearch,
  });
  const { data: invites = [] } = useGetInvitesQuery(poolId);
  const [createInvite, { isLoading: isSending }] = useCreateInviteMutation();

  const memberIds = useMemo(
    () => new Set(members.map((m) => m.userId)),
    [members],
  );

  const invitedIds = useMemo(
    () => new Set(invites.filter((i) => i.type === 'direct' && i.inviteeId).map((i) => i.inviteeId!)),
    [invites],
  );

  const handleInvite = async (userId: string) => {
    try {
      await createInvite({ poolId, type: 'direct', inviteeId: userId }).unwrap();
      setSentIds((prev) => new Set(prev).add(userId));
    } catch {
      // handled by RTK Query
    }
  };

  const getStatus = (userId: string) => {
    if (memberIds.has(userId)) return 'member';
    if (invitedIds.has(userId) || sentIds.has(userId)) return 'invited';
    return 'available';
  };

  return (
    <Stack spacing={2} sx={{ py: 1 }}>
      <TextField
        placeholder="Search by email or phone (min 3 chars)"
        size="small"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {shouldSearch && isFetching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {shouldSearch && !isFetching && users.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No users found.
        </Typography>
      )}

      {shouldSearch && users.length > 0 && (
        <List disablePadding>
          {users.map((user) => {
            const status = getStatus(user.id);
            return (
              <ListItem
                key={user.id}
                sx={{ px: 0, py: 1 }}
                secondaryAction={
                  status === 'member' ? (
                    <Chip label="Member" size="small" sx={{ fontSize: 11 }} />
                  ) : status === 'invited' ? (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                      label="Invited"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontSize: 11 }}
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={isSending ? <CircularProgress size={14} /> : <PersonAddIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleInvite(user.id)}
                      disabled={isSending}
                    >
                      Invite
                    </Button>
                  )
                }
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 14,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: 'primary.main',
                    }}
                  >
                    {user.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary={user.email || user.phone}
                  slotProps={{
                    primary: { variant: 'body2', sx: { fontWeight: 600 } },
                    secondary: { variant: 'caption' },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Stack>
  );
}
