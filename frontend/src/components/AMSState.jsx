import React, { useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { shallowEqual, useSelector } from "react-redux";
import TraySettingsDialog from "./TraySettingsDialog";
import { useAms } from "../hooks/useAms";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

const mapAmsState = (ams) => {
  if (!ams) return [];
  return ams?.ams?.map((amsItem) =>
    amsItem.tray.map((tray) => ({
      humidity: amsItem.humidity,
      trayType: tray.tray_type,
      trayColor: tray.tray_color,
      tempMax: tray.nozzle_temp_max,
      tempMin: tray.nozzle_temp_min,
      trayInfoIdx: tray.tray_info_idx,
      index: tray.index,
    }))
  ) || [];
};


const getTextColorForBackground = (hexColor) => {
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186 ? "#000" : "#fff";
};

const AMSState = () => {
  const {
    errorSettingTray,
    isSettingTray,
    setTray,
    unloadAms,
  } = useAms();

  const {
    ams,
    printType
  } = useSelector(
    state => ({
      ams: state.printer.ams,
      printType: state.printer.printType,
    }),
    shallowEqual
  );

  console.log("AMSState", ams);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTray, setActiveTray] = useState(null);

  const amsStates = mapAmsState(ams);

  if (!amsStates.length) {
    return (
      <Box sx={{ width: 220, mx: "auto", textAlign: "center", pt: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const validGroups = amsStates
    .map((group) => group.filter((tray) => tray.trayType && tray.trayColor))
    .filter((group) => group.length > 0);

  // Klick-Handler zum Öffnen des Dialogs
  const handleTrayClick = (groupIdx, trayIdx) => {
    setActiveGroup(groupIdx);
    setActiveTray(trayIdx);
    setDialogOpen(true);
  };

  // Speichern-Handler
  const handleSave = (updatedTray) => {
    if (activeGroup === null || activeTray === null) return;

    console.log("updatedTray: ", updatedTray);

    setTray({
      amsIndex: activeGroup,
      trayIndex: activeTray,
      trayColor: updatedTray.trayColor,
      trayType: updatedTray.trayType,
      tempMax: updatedTray.tempMax,
      tempMin: updatedTray.tempMin,
      trayInfoIdx: updatedTray.trayInfoIdx,
    });

    setDialogOpen(false);
  };

  const handleUnload = () => {
    unloadAms();
  }

  return (
    <Box
      sx={{
        maxWidth: 420,
        width: '100%',
        color: 'white',
        m: 'auto',
        mt: 2,
        borderRadius: 2,
      }}
    >
      {validGroups.map((trays, gIdx) => (
        <Box key={gIdx}>
          <Typography variant="subtitle2" sx={{ mb: 1 }} textAlign={"center"}>
            AMS {validGroups.length > 1 ? gIdx + 1 : null}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${trays.length}, 1fr)`,
              gap: 1,
            }}
          >
            {trays.map((tray, tIdx) => {
              const bg = tray.trayColor.slice(0, 6);
              const textColor = getTextColorForBackground(bg);
              return (
                <Box
                  key={tIdx}
                  sx={{
                    backgroundColor: `#${bg}`,
                    color: textColor,
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                  }}
                  onClick={() => handleTrayClick(gIdx, tIdx)}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {`${tIdx + 1} ${tray.trayType}`}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {trays.length && trays[0].humidity && (
            <Typography
              variant="subtitle2"
              textAlign="right"
            >
              <WaterDropIcon sx={{ mt: 0.5, color: "rgb(60 126 229)" }} />
              {trays[0].humidity}
            </Typography>
          )}
        </Box>
      ))}

      {activeGroup !== null && activeTray !== null && (
        <TraySettingsDialog
          trayIndex={activeTray + 1}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          tray={validGroups[activeGroup][activeTray]}
          onSave={handleSave}
        />
      )}

      <Button
        variant="outlined"
        color="error"
        onClick={handleUnload}
        disabled={isSettingTray || printType !== "idle"}
        sx={{ mt: 2, width: "100%" }}
      >
        {isSettingTray ? (
          <CircularProgress size={24} />
        ) : (
          "Spule entladen"
        )}
      </Button>
    </Box>
  );
};

export default AMSState;
