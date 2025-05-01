import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  printType: null,
  wifiSignal: null,
  chamberLightMode: null,
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
    }
  },
});

export const {
  setPrintType,
  setWifiSignal,
  setLightMode,
  // … weitere Actions
} = printerSlice.actions;

export default printerSlice.reducer;
