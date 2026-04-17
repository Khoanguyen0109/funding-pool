import {
  Box, Typography, Stack, Avatar, Button, CircularProgress, Card, CardContent, Chip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
  useGetPendingMembersQuery,
  useApproveMemberMutation,
  useRejectMemberMutation,
} from '@/store/api/membersApi';

interface Props {
  poolId: string;
  poolColor: string;
}

export default function PendingMembersSection({ poolId, poolColor }: Props) {
  const theme = useTheme();
  const { data: pending = [], isLoading } = useGetPendingMembersQuery(poolId);
  const [approveMember] = useApproveMemberMutation();
  const [rejectMember] = useRejectMemberMutation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (pending.length === 0) return null;

  return (
    <Card sx={{ mb: 2, borderLeft: `3px solid ${theme.palette.warning.main}` }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <HourglassEmptyIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Pending Requests
          </Typography>
          <Chip label={pending.length} size="small" color="warning" sx={{ height: 20, fontSize: 11 }} />
        </Stack>

        <Stack spacing={1}>
          {pending.map((member) => (
            <Stack
              key={member.id}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', py: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: 13,
                  bgcolor: alpha(poolColor, 0.3),
                }}
              >
                {member.user?.name?.[0] ?? '?'}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {member.user?.name ?? 'Unknown'}
                </Typography>
                {member.user?.email && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {member.user.email}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={0.5}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  sx={{ minWidth: 0, px: 1 }}
                  onClick={() => approveMember({ poolId, userId: member.userId })}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  sx={{ minWidth: 0, px: 1 }}
                  onClick={() => rejectMember({ poolId, userId: member.userId })}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
