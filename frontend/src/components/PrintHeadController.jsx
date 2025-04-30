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
import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LightbulbOutlineIcon from '@mui/icons-material/LightbulbOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePrintHead } from '../hooks/usePrintHead';

export default function PrintHeadController() {
  const [axisMode, setAxisMode] = useState('xy');
  const [step, setStep] = useState(1);
  const [lightOn, setLightOn] = useState(false);
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
      {/* Licht-Toggle */}
      <Box sx={{ mt: 2, mb: 4 }}>
        {isSettingLight
          ? <CircularProgress size={24} />
          : <IconButton
            color={lightOn ? 'warning' : 'primary'}
            disabled={loading}
            onClick={() => {
              const val = lightOn ? 'off' : 'on';
              setLight(val);
              setLightOn(!lightOn);
            }}
          >
            {lightOn ? <LightbulbIcon /> : <LightbulbOutlineIcon />}
          </IconButton>
        }
      </Box>

      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <InputLabel id="step-label">Schritt</InputLabel>
        <Select
          labelId="step-label"
          value={step}
          label="Schritt"
          onChange={e => setStep(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup
        value={axisMode}
        exclusive
        onChange={(_, val) => val && setAxisMode(val)}
        size="small"
        fullWidth
        color="primary"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="xy">X/Y</ToggleButton>
        <ToggleButton value="z">Z</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
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
