import React from 'react';
import { ButtonGroup, Button, CircularProgress, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { usePrintHead } from '../../hooks/usePrintHead';

export const PrintSpeedSelector = ({show = true}) => {

  const { spdLvl } = useSelector((state) => state.printer);
  const { setSpeed, isSettingSpeed } = usePrintHead();

  const handleClick = (newSpeed) => {
    setSpeed(newSpeed);
  };

  if(!show){
    return null;
  }

  return (
    <Box
      sx={{
        maxWidth: 390,
        width: '100%',
        color: 'white',
        m: 'auto',
        mt: 3,
        borderRadius: 2,
      }}
    >
      <ButtonGroup
        variant="outlined"
        aria-label="Druckgeschwindigkeit"
        disabled={isSettingSpeed}
        sx={{
          margin: 'auto',
          width: '100%',
          display: 'flex',              // ensure flex layout
          borderRadius: '8px',
          backgroundColor: '#4040404a',
          fontSize: '8px',
        }}
      >
        <Button
          fullWidth
          variant={spdLvl === 1 ? 'contained' : 'outlined'}
          onClick={() => handleClick(1)}
          sx={{
            flex: 1,                     // equally distribute width
            fontSize: '10px',
            padding: '5px',
          }}
        >
          Silent
        </Button>
        <Button
          fullWidth
          variant={spdLvl === 2 ? 'contained' : 'outlined'}
          onClick={() => handleClick(2)}
          sx={{
            flex: 1,
            fontSize: '10px',
            padding: '5px',
          }}
        >
          Standard
        </Button>
        <Button
          fullWidth
          variant={spdLvl === 3 ? 'contained' : 'outlined'}
          onClick={() => handleClick(3)}
          sx={{
            flex: 1,
            fontSize: '10px',
            padding: '5px',
          }}
        >
          Sport
        </Button>
        <Button
          fullWidth
          variant={spdLvl === 4 ? 'contained' : 'outlined'}
          onClick={() => handleClick(4)}
          sx={{
            flex: 1,
            fontSize: '10px',
            padding: '5px',
          }}
        >
          Ludicrous
        </Button>
      </ButtonGroup>
    </Box>
  );
}
