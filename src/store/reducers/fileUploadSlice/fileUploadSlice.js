// store/reducers/fileUploadSlice/fileUploadSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [], // global file list
};

const fileUploadSlice = createSlice({
  name: "fileUpload",
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    addFile: (state, action) => {
      state.files.push(action.payload);
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((_, i) => i !== action.payload);
    },
    clearFiles: (state) => {
        console.log('called...!');
      state.files = [];
    },
  },
});

export const { setFiles, addFile, removeFile, clearFiles } =
  fileUploadSlice.actions;
export default fileUploadSlice.reducer;
