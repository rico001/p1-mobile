import React from 'react';
import PrintHeadController from '../components/PrintHeadController';
import PrinterStream from '../components/PrinterStream';
import PrinterStatus from '../components/PrinterStatus';
import NozzleTempState from '../components/NozzleTempState';
import BedTempState from '../components/BedTempState';
import { Box } from '@mui/material';
import PrintJobControls from '../components/PrintJobControls';
import CurrentJob from '../components/CurrentJob';

function Printer() {
  return (
    <div
      style={{
        margin: 'auto',
        textAlign: 'center',
        paddingTop: '15px',
      }}
    >
      <PrinterStream />
      <Box display="flex" alignItems="center" gap={2} width={'230px'} justifyContent="center" sx={{ margin: 'auto' }}>
        <CurrentJob />
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={1}
        width={'150px'}
        sx={{ 
          margin: 'auto', 
          pb: '8px', 
          pt: '8px',
          mb: '10px',
          borderRadius: '0px 0px 15px 15px',
          backgroundColor: '#4040404a', 
        }}
      >
        <PrintJobControls />
      </Box>
      <Box display="flex" alignItems="center" gap={2} width={'230px'} justifyContent="center" sx={{ margin: 'auto' }}>
        <NozzleTempState />
        <BedTempState />
      </Box>
      <PrintHeadController />
    </div>
  );
}

export default Printer;