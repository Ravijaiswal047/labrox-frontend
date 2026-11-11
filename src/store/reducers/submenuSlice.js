import { createSlice } from "@reduxjs/toolkit";

const submenuSlice = createSlice({
  name: "submenu",
  initialState: { type: "H" },
  reducers: {
    setSubmenu: (state, action) => {
      state.type = action.payload;
    },
  },
});

export const { setSubmenu } = submenuSlice.actions;
export default submenuSlice.reducer;
