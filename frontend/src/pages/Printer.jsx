import React from 'react';
import { Typography } from '@mui/material';
import PrintHeadController from '../components/PrintHeadController';
import PrinterStream from '../components/PrinterStream';

function Printer() {
  return (
    <div
      style={{
        width: '90%',
        maxWidth: '97%',
        margin: 'auto',
        textAlign: 'center',
        paddingTop: '40px',
      }}
    >
      <PrinterStream />
      <PrintHeadController />
    </div>
  );
}

export default Printer;