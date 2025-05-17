import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  printType: 'idle',
  wifiSignal: 'k.A.',
  chamberLightMode: 'off',

  nozzleTemper: '-',
  nozzleTargetTemper: '-',
  
  bedTemper: '-',
  bedTargetTemper: '-',

  mcPercent: '-',
  mcRemainingTime: '-',

  layerNum: '-',
  totalLayerNum: '-',

  gcodeFile: 'k.A.',
  spdLvl: 2,

  //deep objects
  ams: null,
  printError : {
    error_code: null,
    error_code_hex: null,
    error_message: null,
  },
  logs: []
};

const printerSlice = createSlice({
  name: 'printer',
  initialState,
  reducers: {
    setPrintType(state, action) {
      state.printType = action.payload;
    },
    setWifiSignal(state, action) {
      state.wifiSignal = action.payload;
    },
    setLightMode(state, action) {
      state.chamberLightMode = action.payload;
    },
    setNozzleTemper(state, action) {
      state.nozzleTemper = action.payload;
    },
    setNozzleTargetTemper(state, action) {
      state.nozzleTargetTemper = action.payload;
    },
    setBedTemper(state, action) {
      state.bedTemper = action.payload;
    },
    setBedTargetTemper(state, action) {
      state.bedTargetTemper = action.payload;
    },
    setMcPercent(state, action) {
      state.mcPercent = action.payload;
    },
    setMcRemainingTime(state, action) {
      state.mcRemainingTime = action.payload;
    },
    setLayerNum(state, action) {
      state.layerNum = action.payload;
    },
    setTotalLayerNum(state, action) {
      state.totalLayerNum = action.payload;
    },
    setGcodeFile(state, action) {
      state.gcodeFile = action.payload;
    },
    setAMS(state, action) {
      state.ams = action.payload;
    },
    setSpdLvl(state, action) {
      state.spdLvl = action.payload;
    },
    setLog(state, action) {
      const newLog = action.payload;
    
      // 1. Entferne alten Eintrag mit gleicher ID (falls vorhanden)
      state.logs = state.logs.filter(l => l.id !== newLog.id);
    
      // 2. Wenn mehr als 100 Einträge, ältesten rauswerfen
      if (state.logs.length >= 100) {
        state.logs.shift();
      }
    
      // 3. Neuen Log anhängen
      state.logs.push(newLog);
    },
    setPrintError(state, action) {
      state.printError = action.payload;
    },
  },
});

export const {
  setPrintType,
  setWifiSignal,
  setLightMode,
  setNozzleTemper,
  setNozzleTargetTemper,
  setBedTemper,
  setBedTargetTemper,
  setMcPercent,
  setMcRemainingTime,
  setLayerNum,
  setTotalLayerNum,
  setGcodeFile,
  setAMS,
  setSpdLvl,
  setLog,
  setPrintError
} = printerSlice.actions;

export default printerSlice.reducer;
