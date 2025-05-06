// src/components/TasmotaSwitch.jsx
import React, { useCallback, useMemo } from 'react';
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
  const { isOn, isLoading, error, toggle, isToggling } = useTasmota();

  // derive display props from isOn in one place
  const status = useMemo(() => {
    if (isOn === null) {
      return { color: 'default', title: 'Gerät ist nicht erreichbar', disabled: true };
    }
    return isOn
      ? { color: 'success', title: 'Gerät ist eingeschaltet', disabled: false }
      : { color: 'error',   title: 'Gerät ist ausgeschaltet', disabled: false };
  }, [isOn]);

  // memoized toggle handler with confirmation
  const handleToggle = useCallback(() => {
    const action = isOn ? 'ausschalten' : 'einschalten';
    if (window.confirm(`Sind Sie sicher, dass Sie das Gerät ${action} möchten?`)) {
      toggle();
    }
  }, [isOn, toggle]);

  if (error) {
    return (
      <Typography color="error" p={2}>
        Fehler: {error.message}
      </Typography>
    );
  }

  return (
    <Box display="flex" alignItems="center" pr={1} gap={1}>
      <Tooltip title={status.title} arrow>
          <IconButton
            onClick={handleToggle}
            disabled={isToggling || status.disabled}
            aria-label={status.title}
            color={status.color}
          >
            <PowerSettingsNewIcon  color='white' sx={{ background: 'white', borderRadius: '50%', padding: '2px' }} />
          </IconButton>
      </Tooltip>
    </Box>
  );
}
