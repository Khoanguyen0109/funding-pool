import { useState } from 'react';
import { Tabs, Tab, Stack } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import BottomSheet from '@/components/common/BottomSheet';
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

export default function SharePoolSheet({ poolId, poolName, members, open, onClose }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <BottomSheet open={open} onClose={onClose} title="Share Pool">
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', mx: -3, mb: 2 }}
      >
        <Tab icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Link" />
        <Tab icon={<QrCode2Icon sx={{ fontSize: 18 }} />} iconPosition="start" label="QR Code" />
        <Tab icon={<PersonSearchIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Invite" />
      </Tabs>
      <Stack sx={{ minHeight: 200 }}>
        {tab === 0 && <ShareLinkTab poolId={poolId} />}
        {tab === 1 && <ShareQRTab poolId={poolId} poolName={poolName} />}
        {tab === 2 && <InviteUserTab poolId={poolId} members={members} />}
      </Stack>
    </BottomSheet>
  );
}
