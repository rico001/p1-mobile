import React from 'react';
import { IconButton, CircularProgress, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useSelector } from 'react-redux';
import { usePrintHead } from '../hooks/usePrintHead';

export default function PrintJobControls() {
  const { printType } = useSelector(state => state.printer);
  const {
    stopPrint,
    isStopping,
    pausePrint,
    isPausing,
    resumePrint,
    isResuming
  } = usePrintHead();

  const actionLoading = isStopping || isPausing || isResuming;
  const isPrinting = printType === 'local';

  if (actionLoading) {
    return <CircularProgress size={24} />;
  }

  return (
    <>
 
      <IconButton
        color="primary"
        onClick={(e) => confirm('Aktuellen Druckvorgang wirklich abbrechen?') && stopPrint()}
        disabled={isStopping || !isPrinting}
        sx={{ p:0 }}
      >
        <StopIcon />
      </IconButton>

      <IconButton
        color="primary" 
        onClick={(e) => confirm('Aktuellen Druckvorgang wirklich pausieren?') && pausePrint()}
        disabled={isPausing || !isPrinting}
        sx={{ pr:2, pl:2 }}
      >
        <PauseIcon />
      </IconButton>

      <IconButton
        color="primary"
        onClick={(e) => confirm('Aktuellen Druckvorgang wirklich fortsetzen?') && resumePrint()}
        disabled={isResuming || !isPrinting}
        sx={{ p:0 }}
      >
        <PlayArrowIcon />
      </IconButton>
    </>
  );
}
