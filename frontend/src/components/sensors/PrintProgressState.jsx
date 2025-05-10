import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';
import TimerIcon from '@mui/icons-material/Timer';
import { statusMap } from '../PrinterStatus';

// Component to display print progress percent and remaining time
export function PrintProgressState() {
    const { mcPercent, mcRemainingTime, printType } = useSelector(
        (state) => state.printer
    );

    if (statusMap.idle.value === printType) {
        return null;
    }
    
    return (
        <Tooltip
            title={"Druckfortschritt"}
            arrow
        >
            <Box display="flex" alignItems="center" width="fit-content">
                <PercentIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500, mr: 2 }}>
                    {
                        printType === statusMap.local.value ?
                            `${mcPercent || '-'}%` :
                            '-'
                    }
                </Typography>
                <TimerIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {
                        printType === statusMap.local.value ?
                            `${mcRemainingTime || '-'} min` :
                            '-'
                    }
                </Typography>
            </Box>
        </Tooltip>
    );
}