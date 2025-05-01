import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';

export default function PrinterStatus() {
  const { printType, wifiSignal, chamberLightMode } = useSelector(
    state => state.printer
  );

  return (
    <Box>
      <Typography>Druckerstatus: {printType}</Typography>
      <Typography>WLAN-Signal: {wifiSignal ?? '–'}</Typography>
      <Typography>Beleuchtung: {chamberLightMode}</Typography>
    </Box>
  );
}
