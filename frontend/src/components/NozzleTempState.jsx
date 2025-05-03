import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import BungalowIcon from '@mui/icons-material/Bungalow';
import { roundToOneDecimal } from '../utils/functions';

export default function NozzleTempState() {
  const { nozzleTemper, nozzleTargetTemper } = useSelector(
    (state) => state.printer
  );

  let current = roundToOneDecimal(nozzleTemper);
  let target = roundToOneDecimal(nozzleTargetTemper);
  const isAtTarget = current >= target;
  const color = isAtTarget ? 'success.main' : 'warning.main';

  return (
    <Tooltip
      title={isAtTarget ? 'Düse hat Zieltemperatur erreicht' : 'Düse heizt'}
      arrow
    >
      <Box display="flex" alignItems="center" width={'fit-content'}>
        <BungalowIcon sx={{ color, mr: 1, transform: 'rotate(180deg)' }} />
        <Typography variant="body2" sx={{ fontWeight: 500, color }}>
          {`${current || '-'} / ${target || '-'}°C`}
        </Typography>
      </Box>
    </Tooltip>
  );
}