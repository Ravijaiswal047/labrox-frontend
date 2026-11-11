import { createSlice } from "@reduxjs/toolkit";
import { GetBindDepartment } from "../../../networkServices/opdserviceAPI"; // Adjust the import path as needed

const initialState = {
  GetDepartmentList: [],
  loading: false,
  error: "",
  message: "",
  success: false,
};

export const CommonSlice = createSlice({
  name: "CommonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(GetBindDepartment.fulfilled, (state, { payload }) => {
      state.GetDepartmentList = payload?.data;
      state.loading = false;
      state.success = true;
      state.error = "";
      state.message = payload?.message;
    });
  },
});

export default CommonSlice.reducer;