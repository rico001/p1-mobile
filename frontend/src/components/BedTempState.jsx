import { Box, Tooltip, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import BorderAllIcon from '@mui/icons-material/BorderAll';
import { roundToOneDecimal } from "../utils/functions";


export default function BedTempState() {
    const { bedTemper, bedTargetTemper } = useSelector(
      (state) => state.printer
    );
  
    const current = roundToOneDecimal(bedTemper);
    const target = roundToOneDecimal(bedTargetTemper);
    const isAtTarget = current >= target;
  
    return (
      <Tooltip
        title={isAtTarget ? 'Bett hat Zieltemperatur erreicht' : 'Bett heizt'}
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