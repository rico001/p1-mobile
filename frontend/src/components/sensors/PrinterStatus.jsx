// src/components/PrinterStatus.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const statusMap = {
  local: {
    value: 'local',
    text: '',
    tooltip: 'Der 3D-Drucker arbeitet gerade an einem Job.',
  },
  idle: {
    value: 'idle',
    text: 'Leerlauf',
    tooltip: 'Wartet auf neue Druckaufträge.',
  },
};

export default function PrinterStatus() {
  const { printType } = useSelector((state) => state.printer);

  // Fallback für unbekannte Stati
  const { text, tooltip } = statusMap[printType] || {
    icon: <HelpOutlineIcon sx={{ color: 'warning.main', mr: 1 }} />,
    text: '-',
    tooltip: 'Status unbekannt. Bitte prüfen Sie die Drucker-Verbindung.',
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        width: '100%',
        color: 'white',
        m: 'auto',
        mt: 1,
        borderRadius: 2,
      }}
    >
      <Tooltip title={tooltip} arrow>
        <Box style={{ position: 'relative', width: '100%', width: 'fit-content', margin: 'auto' }}>
          <Typography>
            {text}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}