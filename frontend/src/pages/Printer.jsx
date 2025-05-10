import React from 'react';
import PrintHeadController from '../components/PrintHeadController';
import PrinterStream from '../components/PrinterStream';
import NozzleTempState from '../components/sensors/NozzleTempState';
import BedTempState from '../components/sensors/BedTempState';
import { Box } from '@mui/material';
import PrintJobControls from '../components/PrintJobControls';
import CurrentJob from '../components/CurrentJob';
import { PrintProgressState } from '../components/sensors/PrintProgressState';
import { LayerState } from '../components/sensors/LayerState';
import SpeedSelector from '../components/SpeedSelector';
import { PrinterStatus } from '../components/Printjob/PrintjobStatus';


function Printer() {
  return (
    <div
      style={{
        margin: 'auto',
        textAlign: 'center'
      }}
    >
      <PrinterStream />
      <Box display="flex" alignItems="center" gap={2} justifyContent="center">
        <CurrentJob />
      </Box>
      <PrinterStatus />
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
          borderRadius: '15px 15px 15px 15px'
        }}
      >
        <PrintJobControls />
      </Box>
      <Box display="flex" alignItems="center" gap={2} width={'260px'} justifyContent="center" sx={{ margin: 'auto', mb: 1 }}>
        <NozzleTempState />
        <BedTempState />
      </Box>
      <Box display="flex" alignItems="center" gap={2} width={'260px'} justifyContent="center" sx={{ margin: 'auto', mt: 1 }}>
        <PrintProgressState />
        <LayerState />
      </Box>
      <Box
        sx={{
          margin: 'auto',
          pb: '8px',
          pt: '8px',
          mb: '10px',
        }}
      >
        <SpeedSelector />
      </Box>
      <PrintHeadController />
    </div>
  );
}

export default Printer;