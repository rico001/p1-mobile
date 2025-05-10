import { configureStore } from '@reduxjs/toolkit';
import printerReducer from './printerSlice';
import tasmotaReducer from './tasmotaSlice';
import uiReducesr from './uiSlice';

const store = configureStore({
  reducer: {
    printer: printerReducer,
    tasmota: tasmotaReducer,
    ui: uiReducesr,
  },
});

export default store;
