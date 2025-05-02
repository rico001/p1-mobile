// src/components/WlanStatus.jsx
import React from 'react';
import WifiIcon from '@mui/icons-material/Wifi';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';

const getSignalStrengthNumber = (signal) => {
    const signalValue = parseInt(signal || '-40dBm', 10);
    return signalValue;
}


export default function WlanStatus() {
  const { wifiSignal } = useSelector((state) => state.printer);

  // Extrahiere numerischen Wert aus der dBm-Angabe
  const signalValue = parseInt(getSignalStrengthNumber(wifiSignal), 10);

  // Bestimme Farbe basierend auf Signalstärke
  let color;
  if (signalValue >= -50) {
    color = 'success.main';        // Starkes Signal
  } else if (signalValue > -70) {
    color = 'warning.main';        // Mittleres Signal
  } else {
    color = 'error.main';          // Schwaches Signal
  }

  return (
    <Box display="flex" alignItems="center" p={0.5} bgcolor={'background.paper'} borderRadius={1}>
      <WifiIcon sx={{ color, mr: 1 }} />
      <Typography variant="body2" sx={{ color, fontWeight: 500 }}>
        {wifiSignal}
      </Typography>
    </Box>
  );
}
