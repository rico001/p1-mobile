import React from 'react';
import { Box, Typography, LinearProgress, Button, IconButton } from '@mui/material';
import { shallowEqual, useSelector } from 'react-redux';
import { transparentPng } from '../../utils/functions';
import { usePrintHead } from '../../hooks/usePrintHead';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { PrintError } from '../PrintError';

const converRemainingTime = (remainingTime) => {
  if (remainingTime === undefined || remainingTime === null || remainingTime === 0) {
    return null;
  }
  if (remainingTime > 60) {
    const hours = Math.floor(remainingTime / 60);
    const minutes = remainingTime % 60;
    return `${hours}h ${minutes}m`;
  } else {
    return `${remainingTime}m`;
  }
}

export const CurrenPrintjob = ({ show = true }) => {
  console.log('rendering CurrentPrintjob');
  const {
    stopPrint,
    isStopping,
    pausePrint,
    isPausing,
    resumePrint,
    isResuming
  } = usePrintHead();

  const {
    layerNum,
    totalLayerNum,
    mcPercent,
    printType,
    mcRemainingTime,
    gcodeFile,
    printError
  } = useSelector(
    state => ({
      layerNum: state.printer.layerNum,
      totalLayerNum: state.printer.totalLayerNum,
      mcPercent: state.printer.mcPercent,
      printType: state.printer.printType,
      mcRemainingTime: state.printer.mcRemainingTime,
      gcodeFile: state.printer.gcodeFile,
      printError: state.printer.printError,
    }),
    shallowEqual
  );

  if(!show){
    //return null;
  }

  let isPrinting = printType === 'local';

  return (
    <Box
      sx={{
        maxWidth: 420,
        width: '100%',
        color: 'white',
        m: 'auto',
        mt: 2,
        borderRadius: 2,
      }}
    >
      { /* current printjob with thumbnail */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
        <Box
          sx={{
            width: 105,
            height: 105,
            m: 1,

            bgcolor: 'grey.300',
            borderRadius: 1,
          }}

          component="img"
          src={gcodeFile ? `/thumbnails/${gcodeFile}.png` : transparentPng()}
          alt="Thumbnail"
        />
        { /* Printing progress and status */}
        <Box sx={{ flexGrow: 1, ml: 1, mr: 2 }}>

          <Typography variant="subtitle1" fontWeight={600} textAlign={'left'} mb={1}>
            {gcodeFile || 'k.A.'}
          </Typography>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
              <Typography variant="body2">

              </Typography>
              <Typography variant="body2">
                {`${layerNum || 0} / ${totalLayerNum || '-'}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>

              <Typography variant="body2" fontSize={20} fontWeight={600}>
                {mcPercent ? mcPercent + ' %' : ''}
              </Typography>
              <Typography variant="body2">
                {mcRemainingTime ? 'noch ' + converRemainingTime(mcRemainingTime) : ''}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={mcPercent || 0} sx={{ height: 8, borderRadius: 1, mt: 1, bgcolor: 'grey.200' }} />
          </Box>
        </Box>
      </Box>

      {printError?.error_code_hex && (
        <PrintError
          code={printError.error_code_hex}
          message={printError.error_message}
          infoLink="https://wiki.bambulab.com/en/hms/error-code"
        />
      )}

      { /* Printing actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
        <IconButton
          color="primary"
          onClick={(e) => confirm('Aktuellen Druckvorgang wirklich abbrechen?') && stopPrint()}
          disabled={isStopping || !isPrinting}
          sx={{ p: 0 }}
        >
          <StopIcon sx={{ p: 0.5, backgroundColor: '#4040404a', borderRadius: '100%' }} />
        </IconButton>
        <IconButton
          color="primary"
          onClick={(e) => confirm('Aktuellen Druckvorgang wirklich pausieren?') && pausePrint()}
          disabled={isPausing || !isPrinting}
          sx={{ p: 0 }}
        >
          <PauseIcon sx={{ p: 0.5, backgroundColor: '#4040404a', borderRadius: '100%' }} />
        </IconButton>
        <IconButton
          color="primary"
          onClick={(e) => confirm('Aktuellen Druckvorgang wirklich fortsetzen?') && resumePrint()}
          disabled={isResuming || !isPrinting}
          sx={{ p: 0 }}
        >
          <PlayArrowIcon sx={{ p: 0.5, backgroundColor: '#4040404a', borderRadius: '100%' }} />
        </IconButton>
      </Box>
    </Box>
  );
};
