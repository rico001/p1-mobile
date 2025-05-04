import { configureStore } from '@reduxjs/toolkit';
import printerReducer from './printerSlice';
import tasmotaReducer from './tasmotaSlice';

const store = configureStore({
  reducer: {
    printer: printerReducer,
    tasmota: tasmotaReducer,
  },
});

export default store;
