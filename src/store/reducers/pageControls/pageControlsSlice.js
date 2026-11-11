import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiUrls";

export const fetchPageControls = createAsyncThunk(
  "pageControls/fetchPageControls",
  async (pageID, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(apiUrls.GetPageControlData, {
        pageID,
      });
      const data = res?.data;
      if (data?.success) {
        return { pageID, controls: data.message || [] };
      }
      return rejectWithValue(data);
    } catch (error) {
      console.error("fetchPageControls error:", error);
      return rejectWithValue(err?.response?.data || err);
    }
  }
);

const pageControlsSlice = createSlice({
  name: "pageControls",
  initialState: {
    controlsByPage: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPageControls.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPageControls.fulfilled, (state, action) => {
        const { pageID, controls } = action.payload;
        state.status = "succeeded";
        state.controlsByPage[pageID] = controls;
      })
      .addCase(fetchPageControls.rejected, (state, action) => {
        (state.status = "failed"),
          (state.error = action.payload || action.error);
      });
  },
});

export default pageControlsSlice.reducer;
