import { Box, Tooltip, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import BorderAllIcon from '@mui/icons-material/BorderAll';
import { roundToOneDecimal } from "../../utils/functions";

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
    const { bedTemper, bedTargetTemper } = useSelector(
      (state) => state.printer
    );
  
    const current = roundToOneDecimal(bedTemper);
    const target = roundToOneDecimal(bedTargetTemper);
  
    return (
      <Tooltip
        title={isAtTarget(current, target) ? 'Bett-Temperatur erreicht' : ''}
        arrow
      >
        <Box display="flex" alignItems="center" width={'fit-content'}>
          <BorderAllIcon sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {`${current || '-'} / ${target || '-'}°C`}
          </Typography>
        </Box>
      </Tooltip>
    );
  }