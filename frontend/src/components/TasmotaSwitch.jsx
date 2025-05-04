// src/components/TasmotaSwitch.jsx
import React from 'react';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import {
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Tooltip,
} from '@mui/material';
import { useTasmota } from '../hooks/useTasmota';

export default function TasmotaSwitch() {
  const {
    isOn,
    isLoading,
    error,
    toggle,
    isToggling,
  } = useTasmota();

  const handleToggle = () => {
    const confirmation = confirm(
      isOn
        ? 'Sind Sie sicher, dass Sie das Gerät ausschalten möchten?'
        : 'Sind Sie sicher, dass Sie das Gerät einschalten möchten?'
    );
    if (confirmation) {
      toggle();
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Fehler: {error.message}</Typography>;
  }

  return (
    <Box display="flex" alignItems="center" p={2} gap={1}>
      <Tooltip title={isOn ? 'Ausschalten' : 'Einschalten'}>
        
          <IconButton
            onClick={handleToggle}
            disabled={isToggling}
            aria-label={isOn ? 'Ausschalten' : 'Einschalten'}
            color={isOn ? 'success' : 'error'}
          >
            {isToggling
              ? <CircularProgress size={24} />
              : <PowerSettingsNewIcon color='white' sx={{ background: 'white', borderRadius: '50%', padding: '2px' }} />
            }
          </IconButton>

      </Tooltip>
    </Box>
  );
}
