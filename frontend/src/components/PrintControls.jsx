import React from 'react';
import { IconButton, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useSelector } from 'react-redux';
import { usePrintHead } from '../hooks/usePrintHead';

export default function PrintControls() {
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
        color="secondary"
        onClick={stopPrint}
        disabled={isStopping || !isPrinting}
      >
        <StopIcon />
      </IconButton>

      <IconButton
        color="primary"
        onClick={pausePrint}
        disabled={isPausing || !isPrinting}
      >
        <PauseIcon />
      </IconButton>

      <IconButton
        color="primary"
        onClick={resumePrint}
        disabled={isResuming || !isPrinting}
      >
        <PlayArrowIcon />
      </IconButton>
    </>
  );
}
