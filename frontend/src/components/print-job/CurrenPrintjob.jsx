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
    plateNumber,
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
      plateNumber: state.printer.plateNumber,
    }),
    shallowEqual
  );

  if (!show) {
    return null;
  }

  let isPrinting = printType === 'local' || gcodeFile.includes('auto_cali_for_user_param.gcode');

  return (
    <Box
      sx={{
        maxWidth: 420,
        width: '100%',
        color: 'white',
        m: 'auto',
        mt: 2,
        p: 2,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.8), rgba(28, 35, 51, 0.6))',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(10px)',
      }}
    >
      { /* current printjob with thumbnail */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
        <Box
          component="img"
          src={gcodeFile ? `/thumbnails/${gcodeFile}.png` : transparentPng()}
          alt="Thumbnail"
          sx={{
            width: 125,
            height: 125,
            m: 1,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            objectFit: 'cover',
          }}
        />
        { /* Printing progress and status */}
        <Box sx={{ flexGrow: 1, ml: 1, mr: 2 }}>

          <Typography
            variant="subtitle1"
            fontWeight={600}
            textAlign={'left'}
            mb={1}
            sx={{
              wordBreak: 'break-all'
            }}
          >
            {gcodeFile || 'k.A.'}
          </Typography>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
              <Typography variant="body2">
Plate: {plateNumber || 'k.A.'}
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
          <StopIcon sx={{ p: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '100%', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
        </IconButton>
        <IconButton
          color="primary"
          onClick={(e) => confirm('Aktuellen Druckvorgang wirklich pausieren?') && pausePrint()}
          disabled={isPausing || !isPrinting}
          sx={{ p: 0 }}
        >
          <PauseIcon sx={{ p: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '100%', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
        </IconButton>
        <IconButton
          color="primary"
          onClick={(e) => confirm('Aktuellen Druckvorgang wirklich fortsetzen?') && resumePrint()}
          disabled={isResuming || !isPrinting}
          sx={{ p: 0 }}
        >
          <PlayArrowIcon sx={{ p: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '100%', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
        </IconButton>
      </Box>
    </Box>
  );
};
