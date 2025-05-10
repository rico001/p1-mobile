// src/components/SpeedSelector.jsx
import React from 'react';
import { ButtonGroup, Button, CircularProgress, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { usePrintHead } from '../hooks/usePrintHead';

export default function SpeedSelector() {
    const { spdLvl } = useSelector(state => state.printer);
    const { setSpeed, isSettingSpeed } = usePrintHead();

    const handleClick = newSpeed => {
        setSpeed(newSpeed);
    };

    if (isSettingSpeed) {
        return <CircularProgress size={24} />;
    }

    return (
        <Box
            sx={{
                maxWidth: 420,
                width: '100%',
                color: 'white',
                m: 'auto',
                mt: 2,
                borderRadius: 2,
            }}
        >
            <ButtonGroup
                variant="outlined"
                aria-label="Druckgeschwindigkeit"
                disabled={isSettingSpeed}
                sx={{
                    margin: 'auto',
                    padding: '8px',
                    borderRadius: '8px 8px 8px 8px',
                    backgroundColor: '#4040404a',
                    fontSize: '8px',
                }}
            >
                <Button
                    variant={spdLvl === 1 ? 'contained' : 'outlined'}
                    onClick={() => handleClick(1)}
                    sx={{
                        fontSize: '10px',
                        padding: '5px',
                    }}
                >
                    Silent
                </Button>
                <Button
                    variant={spdLvl === 2 ? 'contained' : 'outlined'}
                    onClick={() => handleClick(2)}
                    sx={{
                        fontSize: '10px',
                        padding: '5px',
                    }}
                >
                    Standard
                </Button>
                <Button
                    variant={spdLvl === 3 ? 'contained' : 'outlined'}
                    onClick={() => handleClick(3)}
                    sx={{
                        fontSize: '10px',
                        padding: '5px',
                    }}
                >
                    Sport
                </Button>
                <Button
                    variant={spdLvl === 4 ? 'contained' : 'outlined'}
                    onClick={() => handleClick(4)}
                    sx={{
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