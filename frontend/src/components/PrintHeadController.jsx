import React, { useState } from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePrintHead } from '../hooks/usePrintHead';
import LightToggle from './LightToggle';
import { statusMap } from './PrinterStatus';
import { useSelector } from 'react-redux';

export default function PrintHeadController() {
  const [axisMode, setAxisMode] = useState('xy');
  const { printType } = useSelector((state) => state.printer);
  if (statusMap.local.value === printType) {
    return null;
  }
  const [step, setStep] = useState(1);
  const {
    move,
    isMoving,
    home,
    isHoming,
    setLight,
    isSettingLight
  } = usePrintHead();

  const loading = isMoving || isHoming || isSettingLight;

  return (
    <Box sx={{ width: 220, mx: 'auto', textAlign: 'center' }}>

      <ToggleButtonGroup
        value={axisMode}
        exclusive
        onChange={(_, val) => val && setAxisMode(val)}
        size="small"
        fullWidth
        color="primary"
        sx={{ mb: 2, backgroundColor: '#4040404a' }}
      >
        <ToggleButton value="xy">X/Y</ToggleButton>
        <ToggleButton value="z">Z</ToggleButton>
      </ToggleButtonGroup>

      <FormControl size="small">
        <Select
          labelId="step-label"
          value={step}
          onChange={e => setStep(Number(e.target.value))}
          sx={{ mb: 1, color: "primary", backgroundColor: '#4040404a' }}
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
        width: '180px',
        margin: 'auto',
        height: '180px',
        backgroundColor: '#4040404a',
        borderRadius: '100%',
        gap: 1,
        justifyItems: 'center',
        alignItems: 'center'
      }}>
        {/* Up */}
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
          : <IconButton
            color="primary"
            disabled={loading}
            sx={{ backgroundColor: '#4040404a', p: 2 }}
            onClick={() => home()}
          >
            <HomeIcon />
          </IconButton>
        }

        {/* Right */}
        <IconButton
          color="primary"
          disabled={axisMode === 'z' || loading}
          onClick={() => move({ axis: 'x', value: step })}
        >
          <ArrowForwardIosIcon />
        </IconButton>

        {/* Down */}
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
