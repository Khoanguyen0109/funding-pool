import { useMemo, useRef, useCallback } from 'react';
import {
  Box, Typography, Button, Stack, CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { QRCodeSVG } from 'qrcode.react';
import {
  useGetInvitesQuery,
  useCreateInviteMutation,
} from '@/store/api/invitesApi';

interface Props {
  poolId: string;
  poolName: string;
}

export default function ShareQRTab({ poolId, poolName }: Props) {
  const { data: invites = [], isLoading } = useGetInvitesQuery(poolId);
  const [createInvite, { isLoading: isCreating }] = useCreateInviteMutation();
  const qrRef = useRef<HTMLDivElement>(null);

  const linkInvite = useMemo(
    () => invites.find((inv) => inv.type === 'link'),
    [invites],
  );

  const inviteUrl = linkInvite
    ? `${window.location.origin}/join/${linkInvite.token}`
    : '';

  const handleGenerate = async () => {
    await createInvite({ poolId, type: 'link' }).unwrap();
  };

  const handleDownload = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement('a');
      link.download = `${poolName.replace(/\s+/g, '-').toLowerCase()}-invite-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, [poolName]);

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
          Generate an invite link first to get a QR code.
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
    <Stack spacing={2} sx={{ py: 1, alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Scan this QR code to join the pool.
      </Typography>

      <Box
        ref={qrRef}
        sx={{
          p: 2,
          bgcolor: '#fff',
          borderRadius: 2,
          display: 'inline-flex',
        }}
      >
        <QRCodeSVG value={inviteUrl} size={180} level="M" />
      </Box>

      <Button
        size="small"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
      >
        Save QR Image
      </Button>
    </Stack>
  );
}
