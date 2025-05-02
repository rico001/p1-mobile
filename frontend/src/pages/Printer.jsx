import React from 'react';
import PrintHeadController from '../components/PrintHeadController';
import PrinterStream from '../components/PrinterStream';
import AutomaticMaterialSystemState from '../components/AutomaticMaterialSystemState';
import PrinterStatus from '../components/PrinterStatus';
import NozzleTempState from '../components/NozzleTempState';
import BedTempState from '../components/BedTempState';

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
      <NozzleTempState />
      <BedTempState />
      <AutomaticMaterialSystemState boxes={[
        { text: 'AMS 1', color: '#4caf50' },
        { text: 'AMS 2', color: '#2196f3' },
        { text: 'AMS 3', color: '#ff9800' },
        { text: 'AMS 4', color: '#f44336' },
      ]} />
      <PrintHeadController />
    </div>
  );
}

export default Printer;