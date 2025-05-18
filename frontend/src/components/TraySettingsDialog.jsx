import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid
} from '@mui/material';

const TraySettingsDialog = ({ open, onClose, tray, onSave }) => {

  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [trayInfoIdx, setTrayInfoIdx] = useState('');


  useEffect(() => {
    if (tray) {
      setType(tray.trayType || '');
      setColor(tray.trayColor || '');
      setTempMax(tray.tempMax || '');
      setTempMin(tray.tempMin || '');
      setTrayInfoIdx(tray.trayInfoIdx || '');
    }
  }, [tray]);

  const handleSave = () => {
    onSave({
      trayType: type.trim(),
      trayColor: color.trim(),
      tempMax: tempMax,
      tempMin: tempMin,
      trayInfoIdx: trayInfoIdx
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tray-Einstellungen (FFFFFFFF oder 161616FF)</DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Material"
                value={type}
                onChange={(e) => setType(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Farbe"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="max. Nozzle Temp."
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                fullWidth
                type="number" 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="min. Nozzle Temp."
                value={tempMin}
                onChange={(e) => setTempMin(e.target.value)}
                fullWidth
                type="number"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained">Aktualisieren</Button>
      </DialogActions>
    </Dialog>
  );
};

TraySettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tray: PropTypes.shape({
    tray_type: PropTypes.string,
    tray_color: PropTypes.string,
    temp_max: PropTypes.number,
    temp_min: PropTypes.number
  }),
  onSave: PropTypes.func.isRequired
};

export default TraySettingsDialog;
