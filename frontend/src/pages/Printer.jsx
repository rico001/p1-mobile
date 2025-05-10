import React from 'react';
import PrintHeadController from '../components/PrintHeadController';
import PrinterStream from '../components/PrinterStream';
import { Box } from '@mui/material';
import SpeedSelector from '../components/SpeedSelector';
import { PrintJobStatus } from '../components/Printjob/PrintjobStatus';
import { useSelector } from 'react-redux';


function Printer() {

  const { printType } = useSelector(state => state.printer); //local or idle
  const _printType = "local"

  return (
    <div
      style={{
        margin: 'auto',
        textAlign: 'center'
      }}
    >
      <PrinterStream />
      <PrintJobStatus />
      <SpeedSelector />
      <PrintHeadController />
    </div>
  );
}

export default Printer;