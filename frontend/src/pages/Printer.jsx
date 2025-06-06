import React from 'react';
import { useSelector } from 'react-redux';
import PrinterStream from '../components/printer-stream/PrinterStream';
import { CurrenPrintjob } from '../components/print-job/CurrenPrintjob';
import { PrintHeadController } from '../components/PrintHeadController';
import { PrintSpeedSelector } from '../components/print-job/PrintSpeedSelector';
import PrinterStatus from '../components/PrinterStatus';


function Printer() {
  console.log('rendering Printer');
  const printType = useSelector(state => state.printer.printType);
  const gcodeFile = useSelector((state) => state.printer.gcodeFile);

  return (
    <div
      style={{
        margin: 'auto',
        textAlign: 'center'
      }}
    >
      <PrinterStream />
      <PrinterStatus />
      <CurrenPrintjob show={printType === 'local' || gcodeFile.includes('auto_cali_for_user_param.gcode')} />
      <PrintSpeedSelector show={printType === 'local' && !gcodeFile.includes('auto_cali_for_user_param.gcode')} />
      <PrintHeadController show={printType === 'idle' && !gcodeFile.includes('auto_cali_for_user_param.gcode')} />
    </div>
  );
}

export default Printer;