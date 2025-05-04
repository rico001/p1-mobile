
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import { statusMap } from '../PrinterStatus';

export function LayerState() {
    const { layerNum, totalLayerNum, printType } = useSelector(
        (state) => state.printer
    );

    return (
        <Tooltip
            title={'Aktuelle Schicht'}
            arrow
        >
            <Box display="flex" alignItems="center" width="fit-content">
                <LayersIcon sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {
                        printType === statusMap.local.value ?
                            `${layerNum || '-'} / ${totalLayerNum || '-'}` :
                            '-'
                    }
                </Typography>
            </Box>
        </Tooltip>
    );
}