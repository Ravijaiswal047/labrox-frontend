import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";

// Thunk to call API
export const getBalance = createAsyncThunk(
  "balance/getBalance",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(apiUrls?.CheckOutstanding);
      return res.data; // response from API
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching balance");
    }
  },
);

const balanceSlice = createSlice({
  name: "balance",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default balanceSlice.reducer;
