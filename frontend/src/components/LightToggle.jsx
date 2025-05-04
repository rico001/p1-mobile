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

  if (isSettingLight) {
    return <CircularProgress size={24} />;
  }

  return (
    <IconButton
      onClick={handleToggle}
      disabled={isSettingLight}
    >
      {isOn ? <LightbulbIcon sx={{ color: '#fffbe3' }} /> : <LightbulbOutlineIcon />}
    </IconButton>
  );
}
