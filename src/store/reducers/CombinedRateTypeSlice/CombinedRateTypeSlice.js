import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  logsData: {},
  logsToggleModal: false,
};

export const CombinedRateTypeSlice = createSlice({
  name: "loadingSlice",
  initialState,
  reducers: {
    setLogsData: (state, actions) => {
      state.logsData = actions.payload;
    },
    setLogToggleModal: (state, actions) => {
      state.logsToggleModal = actions.payload;
    },
  },
});
export const {setLogsData, setLogToggleModal } = CombinedRateTypeSlice.actions;
export default CombinedRateTypeSlice.reducer;
