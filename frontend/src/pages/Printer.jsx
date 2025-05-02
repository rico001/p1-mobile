import React from 'react';
import PrintHeadController from '../components/PrintHeadController';
import PrinterStream from '../components/PrinterStream';
import AutomaticMaterialSystemState from '../components/AutomaticMaterialSystemState';
import PrinterStatus from '../components/PrinterStatus';
import NozzleTempState from '../components/NozzleTempState';
import BedTempState from '../components/BedTempState';
import { Box } from '@mui/material';
import PrintControls from '../components/PrintControls';

function Printer() {
  return (
    <div
      style={{
        width: '90%',
        maxWidth: '97%',
        margin: 'auto',
        textAlign: 'center',
        paddingTop: '15px',
      }}
    >
      <PrinterStream />
      <PrinterStatus />
      <PrintControls />
      <Box display="flex" alignItems="center" gap={1} width={'200px'} justifyContent="center" sx={{ margin: 'auto' }}>
        <NozzleTempState />
        <BedTempState />
      </Box>
      <AutomaticMaterialSystemState />
      <PrintHeadController />
    </div>
  );
}

export default Printer;