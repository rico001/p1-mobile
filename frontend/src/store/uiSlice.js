import { createSlice, current } from '@reduxjs/toolkit';

export const PAGES = {
    MODELS: 'models',
    PRINTER: 'printer',
    AMS: 'ams',
    LOG: 'log',
}

const initialState = {
    currentPage: PAGES.FILES,
};

const uiSlice = createSlice({
  name: 'tasmota',
  initialState,
  reducers: {
    setPage(state, action) {
      state.currentPage = action.payload;
    }
  },
});

export const {
    setPage,
} = uiSlice.actions;

export default uiSlice.reducer;
