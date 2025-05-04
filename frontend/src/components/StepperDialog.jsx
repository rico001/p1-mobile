// StepperDialog.js
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import PrintJobStepper from './PrintJobStepper';

/*
    possible query configurations:
    const bed_levelling = req.query.bed_levelling;
    const flow_cali = req.query.flow_cali;
    const vibration_cali = req.query.vibration_cali;
*/

export default function StepperDialog({ name, thumbnail, onConfirm, open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Druckauftrag: <strong>{ name }</strong></DialogTitle>
      <img
        src={thumbnail}
        alt="Bambu Lab Logo"
        style={{
          width: '100px',
          height: 'auto',
          margin: '5px auto',
          display: 'block'
        }}
      />
      <DialogContent dividers>
        <PrintJobStepper onConfirm={onConfirm} onClose={onClose} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
}
