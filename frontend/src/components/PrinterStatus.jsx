// src/components/PrinterStatus.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function PrinterStatus() {
  const { printType } = useSelector((state) => state.printer);

  // Mapping des Status zu Icon, Farbe und Text
  const statusMap = {
    local: {
      text: 'Druckvorgang läuft',
      tooltip: 'Der 3D-Drucker arbeitet gerade an einem Job.',
    },
    idle: {
      text: 'Leerlauf',
      tooltip: 'Wartet auf neue Druckaufträge.',
    },
  };

  // Fallback für unbekannte Stati
  const { text, tooltip } = statusMap[printType] || {
    icon: <HelpOutlineIcon sx={{ color: 'warning.main', mr: 1 }} />,
    text: '-',
    tooltip: 'Status unbekannt. Bitte prüfen Sie die Drucker-Verbindung.',
  };

  return (
    <Tooltip title={tooltip} arrow>
      <Box style={{ position: 'relative', width: '100%', width: 'fit-content', margin: 'auto' }}>
        <Typography>
          {text}
        </Typography>
      </Box>
    </Tooltip>
  );
}