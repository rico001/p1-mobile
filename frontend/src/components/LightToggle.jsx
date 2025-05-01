import React, { useState, useRef } from 'react';
import { IconButton, CircularProgress } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LightbulbOutlineIcon from '@mui/icons-material/LightbulbOutline';
import { usePrintHead } from '../hooks/usePrintHead';

export default function LightToggle() {
  const { setLight, isSettingLight, lightState } = usePrintHead();
  const clickCounter = useRef(0);
  const [lightOn, setLightOn] = useState(false);

  const isInitiallyOn = lightState === 'on';
  const isActive = clickCounter.current === 0 ? isInitiallyOn : lightOn;

  const toggleLight = () => {
    const next = isActive ? 'off' : 'on';
    setLight(next);
    setLightOn(!isActive);
    clickCounter.current += 1;
  };

  if (isSettingLight) {
    return <CircularProgress size={24} />;
  }

  return (
    <IconButton
      color={isActive ? 'warning' : 'primary'}
      onClick={toggleLight}
      disabled={isSettingLight}
    >
      {isActive ? <LightbulbIcon /> : <LightbulbOutlineIcon />}
    </IconButton>
  );
}
