import React from 'react';
import { Typography } from '@mui/material';
import PrintHeadController from '../components/PrintHeadController';

function Printer() {
  return (
    <div
      style={{
        width: '90%',
        maxWidth: '97%',
        margin: 'auto',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <PrintHeadController />
    </div>
  );
}

export default Printer;