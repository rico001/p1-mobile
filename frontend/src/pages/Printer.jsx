import React from 'react';
import { useSelector } from 'react-redux';
import PrinterStream from '../components/Stream/PrinterStream';
import { CurrenPrintjob } from '../components/Printjob/CurrenPrintjob';
import { PrintHeadController } from '../components/PrintHeadController';
import { PrintSpeedSelector } from '../components/Printjob/PrintSpeedSelector';
import PrinterStatus from '../components/PrinterStatus';


function Printer() {

  const { printType } = useSelector(state => state.printer); //local or idle

  return (
    <div
      style={{
        margin: 'auto',
        textAlign: 'center'
      }}
    >
      <PrinterStream />
      <PrinterStatus />
      <CurrenPrintjob show={printType === 'local'} />
      <PrintSpeedSelector show={printType === 'local'} />
      <PrintHeadController show={printType === 'idle'} />
    </div>
  );
}

export default Printer;