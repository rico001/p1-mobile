import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const statusMap = {
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

const PrinterStatus = () => {
  console.log('rendering PrinterStatus')
  const printType = useSelector((state) => state.printer.printType)
  const gcodeFile = useSelector((state) => state.printer.gcodeFile);

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
        {gcodeFile && gcodeFile.includes('auto_cali_for_user_param.gcode') && (
          <Box>
            <Typography variant="h6" sx={{ color: 'warning.main' }}>
              Kalibrierung läuft
            </Typography>
            <Typography>
              Bitte warten Sie, bis die Kalibrierung abgeschlossen ist. Dies kann einige Minuten dauern.
            </Typography>
          </Box>
        )}
        <Box style={{ position: 'relative', width: '100%', width: 'fit-content', margin: 'auto' }}>
          <Typography>
            {text}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}

export default PrinterStatus;