// src/components/LightToggle.jsx
import React from 'react';
import { IconButton, CircularProgress } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LightbulbOutlineIcon from '@mui/icons-material/LightbulbOutline';
import { useSelector } from 'react-redux';
import { usePrintHead } from '../hooks/usePrintHead';

export default function LightToggle() {
  const { chamberLightMode } = useSelector(state => state.printer);
  const { setLight, isSettingLight } = usePrintHead();

  const isOn = chamberLightMode === 'on';

  const handleToggle = () => {
    const next = isOn ? 'off' : 'on';
    setLight(next);
  };

  return (
    <IconButton
      size="small"
      onClick={handleToggle}
      disabled={isSettingLight}
      sx={{
        bgcolor: 'rgba(0,0,0,0.5)',
        color: '#fff',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
      }}
    >
      {isOn ? <LightbulbIcon sx={{ color: '#fffbe3' }}  fontSize="small" /> : <LightbulbOutlineIcon fontSize="small" />}
    </IconButton>
  );
}
