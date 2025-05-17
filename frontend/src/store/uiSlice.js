import { createSlice, current } from '@reduxjs/toolkit';

export const PAGES = {
    MODELS: 'models',
    PRINTER: 'printer',
    AMS: 'ams',
    LOG: 'log',
}

const initialState = {
    currentPage: PAGES.FILES,
    env: {
        thirdPartyIframeToggleSrc: ''
    },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPage(state, action) {
      state.currentPage = action.payload;
    },
    setEnv(state, action) {
      state.env = action.payload;
    },
  },
});

export const {
    setPage,
    setEnv,
} = uiSlice.actions;

export default uiSlice.reducer;
