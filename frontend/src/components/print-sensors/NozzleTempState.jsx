import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import BungalowIcon from '@mui/icons-material/Bungalow';
import { roundToOneDecimal } from '../../utils/functions';

export default function NozzleTempState() {
  console.log('rendering NozzleTempState');
  const { nozzleTemper, nozzleTargetTemper } = useSelector(
    state => ({
      nozzleTemper:       state.printer.nozzleTemper,
      nozzleTargetTemper: state.printer.nozzleTargetTemper
    }),
    shallowEqual
  );

  let current = roundToOneDecimal(nozzleTemper);
  let target = roundToOneDecimal(nozzleTargetTemper);
  const isAtTarget = current >= target;

  return (
    <Tooltip
      title={isAtTarget ? 'Düse hat Zieltemperatur erreicht' : 'Düse heizt'}
      arrow
    >
      <Box display="flex" alignItems="center" width={'fit-content'}>
        <BungalowIcon sx={{ mr: 1, transform: 'rotate(180deg)' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {`${current || '-'} / ${target || '-'}°C`}
        </Typography>
      </Box>
    </Tooltip>
  );
}