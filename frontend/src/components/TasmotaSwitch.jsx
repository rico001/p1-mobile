import React, { useState, useCallback, useMemo } from 'react';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from '@mui/material';
import { useTasmota } from '../hooks/useTasmota';

export default function TasmotaSwitch() {
  const { isOn, isLoading, error, toggle, isToggling } = useTasmota();
  const [open, setOpen] = useState(false);

  // derive display props from isOn in one place
  const status = useMemo(() => {
    if (isOn === null) {
      return { color: 'default', title: 'Gerät ist nicht erreichbar', disabled: true, label: 'Offline' };
    }
    return isOn
      ? { color: 'success', title: 'Gerät ist eingeschaltet', disabled: false, label: 'Eingeschaltet', colorSwitch: 'error' }
      : { color: 'error', title: 'Gerät ist ausgeschaltet', disabled: false, label: 'Ausgeschaltet', colorSwitch: 'success' };
  }, [isOn]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleToggle = useCallback(() => {
    toggle();
  }, [toggle]);

  if (error) {
    return (
      <Typography color="error" p={2}>
        Fehler: {error.message}
      </Typography>
    );
  }

  return (
    <>
      <Box display="flex" alignItems="center" bgcolor={'background.paper'} borderRadius={100} mr={1}>
        <Tooltip title={status.title} arrow>
          <IconButton onClick={handleOpen} disabled={isToggling || status.disabled} color={status.color} size="small">
            <PowerSettingsNewIcon sx={{ height: "20px", width: "auto" }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="tasmota-switch-dialog"
        sx={{ '& .MuiDialog-paper': { width: 'auto', minWidth: '300px' } }}
      >
        <DialogTitle id="tasmota-switch-dialog" sx={{ m: 0, p: 2 }}>
          Tasmota Switch
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
          <Button
            onClick={() => { handleToggle(); handleClose(); }}
            disabled={isToggling || status.disabled}
            variant="contained"
            color={status.colorSwitch}
          >
            {isOn ? 'Ausschalten' : 'Einschalten'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}