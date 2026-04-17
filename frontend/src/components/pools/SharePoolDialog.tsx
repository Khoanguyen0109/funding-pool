import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Tab, Tabs, Stack, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ShareLinkTab from './ShareLinkTab';
import ShareQRTab from './ShareQRTab';
import InviteUserTab from './InviteUserTab';
import type { PoolMembership } from '@/types';

interface Props {
  poolId: string;
  poolName: string;
  members: PoolMembership[];
  open: boolean;
  onClose: () => void;
}

export default function SharePoolDialog({ poolId, poolName, members, open, onClose }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Share Pool</span>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        <Tab icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Link" />
        <Tab icon={<QrCode2Icon sx={{ fontSize: 18 }} />} iconPosition="start" label="QR Code" />
        <Tab icon={<PersonSearchIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Invite User" />
      </Tabs>

      <DialogContent>
        <Stack sx={{ minHeight: 200 }}>
          {tab === 0 && <ShareLinkTab poolId={poolId} />}
          {tab === 1 && <ShareQRTab poolId={poolId} poolName={poolName} />}
          {tab === 2 && <InviteUserTab poolId={poolId} members={members} />}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
