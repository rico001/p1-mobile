import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Box, Typography, Tooltip, SvgIcon } from '@mui/material';
import { roundToOneDecimal } from '../../utils/functions';
import NozzleIcon from '../../assets/nozzle.svg?react';

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
        <SvgIcon component={NozzleIcon} inheritViewBox sx={{ width: 24, height: 24, color: 'currentColor', mr: 1 }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {`${current || '-'} / ${target || '-'}°C`}
        </Typography>
      </Box>
    </Tooltip>
  );
}