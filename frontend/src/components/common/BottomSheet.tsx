import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px 20px 0 0',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
      </Box>

      {/* Header */}
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Scrollable content */}
      <Box sx={{ overflowY: 'auto', px: 3, pb: 4 }}>
        {children}
      </Box>
    </Drawer>
  );
}
