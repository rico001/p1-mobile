import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    switch: false,
};

const tasmotaSlice = createSlice({
  name: 'tasmota',
  initialState,
  reducers: {
    setSwitch(state, action) {
      state.switch = action.payload;
    },
  },
});

export const {
  setSwitch,
} = tasmotaSlice.actions;

export default tasmotaSlice.reducer;
