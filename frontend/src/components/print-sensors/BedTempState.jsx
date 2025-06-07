import { Box, SvgIcon, Tooltip, Typography } from "@mui/material";
import { shallowEqual, useSelector } from "react-redux";
import { roundToOneDecimal } from "../../utils/functions";
import BedIcon from '../../assets/bed.svg?react';

const isAtTarget = (current, target) => {
  // current ist max 1 grad über target oder 1 grad drunter
  if (current === undefined || target === undefined) {
    return false;
  }
  if (current === target) {
    return true;
  }
  if (current > target) {
    return current - target <= 1;
  }
  if (current < target) {
    return target - current <= 1;
  }
  return false;
}


export default function BedTempState() {

  console.log('rendering BedTempState');
  const { bedTemper, bedTargetTemper } = useSelector(
    state => ({
      bedTemper:       state.printer.bedTemper,
      bedTargetTemper: state.printer.bedTargetTemper
    }),
    shallowEqual
  );
  
    const current = roundToOneDecimal(bedTemper);
    const target = roundToOneDecimal(bedTargetTemper);
  
    return (
      <Tooltip
        title={isAtTarget(current, target) ? 'Bett-Temperatur erreicht' : ''}
        arrow
      >
        <Box display="flex" alignItems="center" width={'fit-content'}>
          <SvgIcon component={BedIcon} inheritViewBox sx={{ width: 24, height: 24, color: 'currentColor', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {`${current || '-'} / ${target || '-'}°C`}
          </Typography>
        </Box>
      </Tooltip>
    );
  }