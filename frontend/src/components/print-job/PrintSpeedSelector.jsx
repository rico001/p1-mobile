import React from 'react';
import { ButtonGroup, Button, CircularProgress, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { usePrintHead } from '../../hooks/usePrintHead';

export const PrintSpeedSelector = ({show = true}) => {
  console.log('rendering PrintSpeedSelector');
  const spdLvl = useSelector((state) => state.printer.spdLvl)
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
        width: '90%',
        color: 'white',
        m: 'auto',
        mt: 3,
        borderRadius: '12px',
      }}
    >
      <ButtonGroup
        variant="outlined"
        aria-label="Druckgeschwindigkeit"
        disabled={isSettingSpeed}
        sx={{
          margin: 'auto',
          width: '100%',
          display: 'flex',
          borderRadius: '10px',
          backgroundColor: 'rgba(22, 27, 34, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '8px',
          overflow: 'hidden',
          '& .MuiButton-root': {
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
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
