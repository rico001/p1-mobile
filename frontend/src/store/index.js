import { configureStore } from '@reduxjs/toolkit';
import printerReducer from './printerSlice';

const store = configureStore({
  reducer: {
    printer: printerReducer,
  },
});

export default store;
