import React from 'react';
import { Typography } from '@mui/material';
import PrintHeadController from '../components/PrintHeadController';

function Printer() {
  return (
    <>
      <Typography variant="h4" gutterBottom>Drucker</Typography>
      <PrintHeadController />
    </>
  );
}

export default Printer;