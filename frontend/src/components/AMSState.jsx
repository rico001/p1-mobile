import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { usePrintHead } from "../hooks/usePrintHead";
import { useSelector } from "react-redux";

const getTextColorForBackground = (hexColor) => {
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminance > 186 ? '#000' : '#fff';
};

const AMSState = () => {
  console.log('rendering AMSState');

  const ams = useSelector((state) => state.printer.ams)

  let amsStates = ams?.ams?.map(ams => ams.tray.map(tray => ({
    tray_type: tray.tray_type,
    tray_color: tray.tray_color,
  })));

  console.log("amsStates", amsStates);
  if (!amsStates) {
    return (
      <Box sx={{ width: 220, mx: 'auto', textAlign: 'center', pt: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const validGroups = Array.isArray(amsStates)
    ? amsStates.map(group =>
      (Array.isArray(group) ? group : []).filter(tray => tray?.tray_type && tray?.tray_color)
    ).filter(group => group.length > 0)
    : [];

  if (validGroups.length === 0) {
    return (
      <Box sx={{ width: 220, mx: 'auto', textAlign: 'center', pt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Keine AMS-Daten verfügbar
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 220, mx: 'auto', pt: 1 }}>
      {validGroups.map((group, groupIndex) => (
        <Box key={groupIndex} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            AMS {validGroups.length > 1 && groupIndex + 1}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${group.length}, 1fr)`,
              gap: 1,
            }}
          >
            {group.map((tray, trayIndex) => {
              const bg = tray.tray_color.slice(0, 6);
              const textColor = getTextColorForBackground(bg);
              return (
                <Box
                  key={trayIndex}
                  sx={{
                    backgroundColor: `#${bg}`,
                    color: textColor,
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {`${trayIndex + 1} ${tray.tray_type}`}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default AMSState;
