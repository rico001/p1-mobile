// src/components/PrintHeadController.jsx
import React, { useState } from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePrintHead } from '../hooks/usePrintHead';

export default function PrintHeadController() {
  const [axisMode, setAxisMode] = useState('xy'); // 'xy' or 'z'
  const [step, setStep] = useState(1);
  const { move, isMoving, home, isHoming } = usePrintHead();

  const loading = isMoving || isHoming;

  const handleAxisToggle = (_, val) => {
    if (val) setAxisMode(val);
  };

  const handleStepChange = e => {
    setStep(Number(e.target.value));
  };

  return (
    <Box sx={{ width: 220, mx: 'auto', textAlign: 'center' }}>
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <InputLabel id="step-select-label">Schritt</InputLabel>
        <Select
          labelId="step-select-label"
          value={step}
          label="Schritt"
          onChange={handleStepChange}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup
        value={axisMode}
        exclusive
        onChange={handleAxisToggle}
        size="small"
        fullWidth
        color="primary"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="xy">X/Y</ToggleButton>
        <ToggleButton value="z">Z</ToggleButton>
      </ToggleButtonGroup>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          gap: 1,
          justifyItems: 'center',
          alignItems: 'center',
        }}
      >
        {/* Up: Y+ or Z- */}
        <Box />
        <IconButton
          color="primary"
          disabled={loading}
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
          disabled={axisMode === 'z' || loading}
          onClick={() => move({ axis: 'x', value: -step })}
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        {/* Home */}
        {isHoming
          ? <CircularProgress size={24} />
          : (
            <IconButton
              color="primary"
              disabled={loading}
              onClick={() => home()}
            >
              <HomeIcon />
            </IconButton>
          )
        }

        {/* Right */}
        <IconButton
          color="primary"
          disabled={axisMode === 'z' || loading}
          onClick={() => move({ axis: 'x', value: step })}
        >
          <ArrowForwardIosIcon />
        </IconButton>

        {/* Down: Y- or Z+ */}
        <Box />
        <IconButton
          color="primary"
          disabled={loading}
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
