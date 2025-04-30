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
  Typography,
  CircularProgress
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePrintHead } from '../hooks/usePrintHead';

export default function PrintHeadController() {
  const [axisMode, setAxisMode] = useState('xy'); // 'xy' or 'z'
  const [step, setStep] = useState(1);
  const mutation = usePrintHead();

  const handleAxisToggle = (_, val) => {
    if (val) setAxisMode(val);
  };

  const handleStepChange = (e) => {
    setStep(Number(e.target.value));
  };

  const move = (axis, value) => {
    mutation.mutate({ axis, value });
  };

  return (
    <Box sx={{ width: 200, mx: 'auto', textAlign: 'center' }}>
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <InputLabel id="step-select-label">Schritt</InputLabel>
        <Select
          labelId="step-select-label"
          value={step}
          label="Schritt(e)"
          onChange={handleStepChange}
        >
          {[1,2,3,4,5].map(n => (
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
          alignItems: 'center'
        }}
      >
        {/* Up: Y+ or Z- */}
        <Box />
        <IconButton
          onClick={() =>
            move(
              axisMode === 'z' ? 'z' : 'y',
              axisMode === 'z' ? -step : step
            )
          }
          disabled={mutation.isLoading}
        >
          <ArrowUpwardIcon />
        </IconButton>
        <Box />

        {/* Left/Right: X */}
        <IconButton
          disabled={axisMode === 'z' || mutation.isLoading}
          onClick={() => move('x', -step)}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        {mutation.isLoading
          ? <CircularProgress size={24} />
          : <Box />
        }
        <IconButton
          disabled={axisMode === 'z' || mutation.isLoading}
          onClick={() => move('x', step)}
        >
          <ArrowForwardIosIcon />
        </IconButton>

        {/* Down: Y- or Z+ */}
        <Box />
        <IconButton
          onClick={() =>
            move(
              axisMode === 'z' ? 'z' : 'y',
              axisMode === 'z' ? step : -step
            )
          }
          disabled={mutation.isLoading}
        >
          <ArrowDownwardIcon />
        </IconButton>
        <Box />
      </Box>
    </Box>
  );
}
