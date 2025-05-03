import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import { statusMap } from './PrinterStatus';

export default function CurrentJob() {
  const { gcodeFile, printType } = useSelector(
    (state) => state.printer
  );

  if(printType === statusMap.idle.value) {
    return '';
  }

  return (
    <Tooltip
      title={"aktueller Druck"}
    >
      <Box display="flex" alignItems="center" width={'fit-content'}>
        <img
          src={`/thumbnails/${gcodeFile}.png`}
          alt="Thumbnail"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '4px',
            marginRight: '8px',
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {gcodeFile || '-'}
        </Typography>
      </Box>
    </Tooltip>
  );
}