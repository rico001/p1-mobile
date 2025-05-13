import React, { useState } from 'react';
import WifiIcon from '@mui/icons-material/Wifi';
import CloseIcon from '@mui/icons-material/Close';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';

const getSignalStrengthNumber = (signal) => {
  if (signal === 'offline') {
    return -100;
  }
  const parsed = parseInt(signal?.replace('dBm', ''), 10);
  return isNaN(parsed) ? -40 : parsed;
};

export default function WlanStatus() {
  console.log('rendering WlanStatus');
  const wifiSignal = useSelector((state) => state.printer.wifiSignal)
  const signalValue = getSignalStrengthNumber(wifiSignal);
  const [open, setOpen] = useState(false);

  // Bestimme Farbe basierend auf Signalstärke
  let color;
  if (signalValue >= -50) {
    color = 'success.main';        // Starkes Signal
  } else if (signalValue > -70) {
    color = 'warning.main';        // Mittleres Signal
  } else {
    color = 'error.main';          // Schwaches Signal
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>

      <Box display="flex" alignItems="center" bgcolor={'background.paper'} borderRadius={100}>
        <IconButton onClick={handleOpen} size="small">
          {wifiSignal === 'offline' ? <WifiOffIcon sx={{ color, height: "20px", width: "auto" }} /> : <WifiIcon sx={{ color, height: "20px", width: "auto" }} />}
        </IconButton>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="wlan-status-dialog"
        sx={{ '& .MuiDialog-paper': { width: 'auto', minWidth: '300px' } }}
      >
        {/* Dialog Header */}
        <DialogTitle id="wlan-status-dialog" sx={{ m: 0, p: 2 }}>
          WLAN Status
          <IconButton
            aria-label="close"

            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8, backgroundColor: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" p={1}>
            {wifiSignal === 'offline' ? (
              <WifiOffIcon sx={{ color, width: "auto", mr: 1 }} />
            ) : (
              <WifiIcon sx={{ color, width: "auto", mr: 1 }} />
            )}
            <Typography variant="body1" sx={{ color, fontWeight: 500, textAlign: 'center' }}>
              {wifiSignal}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
