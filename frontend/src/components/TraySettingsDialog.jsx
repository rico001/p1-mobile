// src/components/TraySettingsDialog.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Grid
} from '@mui/material';
import RgbPicker from './RgbPicker';

const TraySettingsDialog = ({ open, onClose, tray, onSave }) => {
  const [type, setType] = useState('');
  const [colorRgb, setColorRgb] = useState({ r: 22, g: 22, b: 22 });
  const [tempMax, setTempMax] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [trayInfoIdx, setTrayInfoIdx] = useState('');

  useEffect(() => {
    if (tray) {
      setType(tray.trayType || '');
      // trayColor ist String "RRGGBBAA"
      if (tray.trayColor && tray.trayColor.length >= 8) {
        const hex = tray.trayColor.slice(0, 6);
        setColorRgb({
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        });
      }
      setTempMax(tray.tempMax || '');
      setTempMin(tray.tempMin || '');
      setTrayInfoIdx(tray.trayInfoIdx || '');
    }
  }, [tray]);

  const handleSave = () => {
    // RGB → HEX und Alpha "FF" anhängen
    const hex = [colorRgb.r, colorRgb.g, colorRgb.b]
      .map(c => c.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    onSave({
      trayType: type.trim(),
      trayColor: `${hex}FF`,
      tempMax,
      tempMin,
      trayInfoIdx,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tray-Einstellungen (RGB-Picker)</DialogTitle>
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
              {/* Unser neuer RGB-Picker */}
              <RgbPicker color={colorRgb} onChange={setColorRgb} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="max. Nozzle Temp."
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                type="number"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="min. Nozzle Temp."
                value={tempMin}
                onChange={(e) => setTempMin(e.target.value)}
                type="number"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained">
          Aktualisieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TraySettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tray: PropTypes.shape({
    trayType: PropTypes.string,
    trayColor: PropTypes.string,       // "RRGGBBAA"
    tempMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tempMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    trayInfoIdx: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

export default TraySettingsDialog;
