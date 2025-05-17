import { configureStore } from '@reduxjs/toolkit';
import printerReducer from './printerSlice';
import tasmotaReducer from './tasmotaSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    printer: printerReducer,
    tasmota: tasmotaReducer,
    ui: uiReducer,
  },
});

export default store;
