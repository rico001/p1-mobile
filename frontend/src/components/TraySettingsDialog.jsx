// src/components/TraySettingsDialog.js
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
  Grid,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import RgbPicker from './RgbPicker';

const posstibleTrayTypes = [
  "ABS", "ABS-GF", "ASA", "ASA-Aero", "BVOH", "PCTG", "EVA", "HIPS",
  "PA", "PA-CF", "PA-GF", "PA6-CF", "PA11-CF", "PC", "PC-CF", "PCTG",
  "PE", "PE-CF", "PET-CF", "PETG", "PETG-CF", "PETG-CF10", "PHA", "PLA",
  "PLA-AERO", "PLA-CF", "PP", "PP-CF", "PP-GF", "PPA-CF", "PPA-GF",
  "PPS", "PPS-CF", "PVA", "PVB", "SBS", "TPU"
]

const TraySettingsDialog = ({ open, onClose, tray, trayIndex, onSave }) => {
  const [type, setType] = useState('');
  const [colorRgb, setColorRgb] = useState({ r: 22, g: 22, b: 22 });
  const [tempMax, setTempMax] = useState('');
  const [tempMin, setTempMin] = useState('');
  const [trayInfoIdx, setTrayInfoIdx] = useState('');

  // Für den Farb-Dialog
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [tempColor, setTempColor] = useState(colorRgb);

  // Sync initial tray-values
  useEffect(() => {
    if (tray) {
      setType(tray.trayType || '');
      if (tray.trayColor?.length >= 8) {
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

  const openColorDialog = () => {
    setTempColor(colorRgb);
    setColorDialogOpen(true);
  };

  const handleSave = () => {
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

  const hexString = () =>
    '#' +
    [colorRgb.r, colorRgb.g, colorRgb.b]
      .map(c => c.toString(16).padStart(2, '0'))
      .join('');

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Spule {trayIndex} ({trayInfoIdx})</DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
            <Grid container spacing={2} justifyContent={'center'} alignItems={'center'}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="tray-type-label">Typ</InputLabel>
                  <Select
                    labelId="tray-type-label"
                    id="tray-type"
                    value={type}
                    label="Typ"
                    onChange={e => setType(e.target.value)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {posstibleTrayTypes.map(trayType => (
                      <MenuItem key={trayType} value={trayType}>
                        {trayType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Farbe (Hex)"
                  value={hexString()}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box
                          sx={{
                            width: 35,
                            position: 'absolute',
                            left: 'calc(100% - 50px)',
                            cursor: 'pointer',
                            height: 35,
                            bgcolor: hexString(),
                            border: '1px solid rgba(0,0,0,0.2)',
                            borderRadius: '50%'
                          }}
                        />
                      </InputAdornment>
                    )
                  }}
                  onClick={openColorDialog}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="max. Nozzle Temp."
                  value={tempMax}
                  onChange={e => setTempMax(e.target.value)}
                  type="number"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="min. Nozzle Temp."
                  value={tempMin}
                  onChange={e => setTempMin(e.target.value)}
                  type="number"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button
            onClick={handleSave}
            variant="contained"
          >
            Aktualisieren
          </Button>
        </DialogActions>
      </Dialog>
      {/* Farb-Dialog */}
      <Dialog
        open={colorDialogOpen}
        onClose={() => setColorDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Farbe wählen</DialogTitle>
        <DialogContent dividers>
          <RgbPicker color={tempColor} onChange={setTempColor} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={() => {
              setColorRgb(tempColor);
              setColorDialogOpen(false);
            }}
            variant="contained"
          >
            Übernehmen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
};

TraySettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  trayIndex: PropTypes.number,
  tray: PropTypes.shape({
    trayType: PropTypes.string,
    trayColor: PropTypes.string,
    tempMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tempMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    trayInfoIdx: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
};

export default TraySettingsDialog;
