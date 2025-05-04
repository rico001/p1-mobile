import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  printType: null,
  wifiSignal: null,
  chamberLightMode: null,

  nozzleTemper: null,
  nozzleTargetTemper: null,
  
  bedTemper: null,
  bedTargetTemper: null,
  mcPercent: null,
  mcRemainingTime: null,
  layerNum: null,
  totalLayerNum: null,
  gcodeFile: null,
  spdLvl: 2,

  //deep objects
  ams: null,
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
    }
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
  setSpdLvl
} = printerSlice.actions;

export default printerSlice.reducer;
