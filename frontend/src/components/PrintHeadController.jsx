import React, { useState } from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Tooltip
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { usePrintHead } from '../hooks/usePrintHead';

export const PrintHeadController = ({ show = true }) => {
  console.log('rendering PrintHeadController');
  const [axisMode, setAxisMode] = useState('xy');
  const [step, setStep] = useState(1);

  const {
    move,
    isMoving,
    home,
    isHoming,
    calibratePrinter,
    isCalibrating,
  } = usePrintHead();

  if (!show) {
    return null;
  }

  const loading = isMoving || isHoming || isCalibrating;

  return (
    <Box
      sx={{
        maxWidth: 390,
        width: '90%',
        color: 'white',
        m: 'auto',
        mt: 2,
        borderRadius: '12px',
        p: 2,
        background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.8), rgba(28, 35, 51, 0.6))',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* IconButton for Statt Calibration */}
      <Tooltip
        title="Starte Kalibrierung"
        arrow
        placement="top"
      >
      <IconButton
        color="primary"
        sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        onClick={() => confirm('Möchtest du die Kalibrierung starten?') && calibratePrinter()}
        disabled={loading}
      >
        <SettingsSuggestIcon />
      </IconButton>
      </Tooltip>

      {/* Axis Selection */}
      <ToggleButtonGroup
        value={axisMode}
        exclusive
        onChange={(_, val) => val && setAxisMode(val)}
        size="small"
        fullWidth
        color="primary"
        sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <ToggleButton value="xy">X/Y</ToggleButton>
        <ToggleButton value="z">Z</ToggleButton>
      </ToggleButtonGroup>

      {/* Step size */}
      <FormControl size="small">
        <Select
          labelId="step-label"
          value={step}
          onChange={e => setStep(Number(e.target.value))}
          sx={{ mb: 1, color: "primary", backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        width: '160px',
        margin: 'auto',
        height: '160px',
        backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '100%',
        gap: 1,
        justifyItems: 'center',
        alignItems: 'center'
      }}>
        {/* Up */}
        <Box />
        <IconButton
          color="primary"
          sx={{ pointerEvents: loading ? 'none' : 'auto' }}
          onClick={() =>
            move({
              axis: axisMode === 'z' ? 'z' : 'y',
              value: axisMode === 'z' ? -step : step
            })
          }
        >
          <ArrowUpwardIcon />
        </IconButton>
        <Box />

        {/* Left */}
        <IconButton
          color="primary"
          sx={{ pointerEvents: loading ? 'none' : 'auto' }}
          disabled={axisMode === 'z'}
          onClick={() => move({ axis: 'x', value: -step })}
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        {/* Home */}
        <IconButton
          color="primary"
          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)', p: 2, pointerEvents: loading ? 'none' : 'auto' }}
          onClick={() => home()}
        >
          <HomeIcon />
        </IconButton>

        {/* Right */}
        <IconButton
          color="primary"
          sx={{ pointerEvents: loading ? 'none' : 'auto' }}
          disabled={axisMode === 'z'}
          onClick={() => move({ axis: 'x', value: step })}
        >
          <ArrowForwardIosIcon />
        </IconButton>

        {/* Down */}
        <Box />
        <IconButton
          color="primary"
          sx={{ pointerEvents: loading ? 'none' : 'auto' }}
          onClick={() =>
            move({
              axis: axisMode === 'z' ? 'z' : 'y',
              value: axisMode === 'z' ? step : -step
            })
          }
        >
          <ArrowDownwardIcon />
        </IconButton>
        <Box />
      </Box>
    </Box>
  );
}
