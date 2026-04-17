import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, CircularProgress, Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useGetInvitePreviewQuery, useRedeemInviteMutation } from '@/store/api/invitesApi';
import { useState } from 'react';

export default function JoinPoolPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: preview, isLoading, error } = useGetInvitePreviewQuery(token!);
  const [redeemInvite, { isLoading: isRedeeming }] = useRedeemInviteMutation();
  const [redeemed, setRedeemed] = useState(false);

  const handleJoin = async () => {
    try {
      await redeemInvite(token!).unwrap();
      setRedeemed(true);
    } catch {
      // handled by RTK Query
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !preview) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card sx={{ maxWidth: 420, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Invalid Invite</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This invite link is invalid or has been revoked.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const { pool, expired, alreadyMember, alreadyPending } = preview;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card sx={{ maxWidth: 420, width: '100%', borderTop: `3px solid ${pool.color}` }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              bgcolor: alpha(pool.color, 0.15),
              mx: 'auto',
              mb: 2,
            }}
          >
            {pool.icon}
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {pool.name}
          </Typography>

          {pool.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {pool.description}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            Created by {pool.owner.name}
          </Typography>

          <Box sx={{ mt: 3 }}>
            {expired ? (
              <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                <ErrorOutlineIcon sx={{ fontSize: 36, color: 'error.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                  This invite has expired
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </Stack>
            ) : alreadyMember ? (
              <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 36, color: 'success.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  You're already a member
                </Typography>
                <Button variant="contained" onClick={() => navigate(`/pools/${pool.owner.name}`)}>
                  View Pool
                </Button>
              </Stack>
            ) : alreadyPending ? (
              <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                <HourglassEmptyIcon sx={{ fontSize: 36, color: 'warning.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  Your request is pending approval
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </Stack>
            ) : redeemed ? (
              <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 36, color: 'success.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Request sent!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Waiting for the pool owner to approve your request.
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={isRedeeming ? <CircularProgress size={18} color="inherit" /> : <GroupAddIcon />}
                onClick={handleJoin}
                disabled={isRedeeming}
                sx={{ bgcolor: pool.color, '&:hover': { bgcolor: alpha(pool.color, 0.85) } }}
              >
                Request to Join
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
