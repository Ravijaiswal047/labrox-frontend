// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   loading: false,
//   reprintLabNo: null,
//   uploadExcelFileModal: false,
//   importExcelData: [],
//   menuSettingLanguage: false,
//   themeMenuToggle: false,
//   rateTypeControllerData: [],
//   refLabModalData: null,
//   refDoctorModalData: null,
//   refreshLoad: false,
//   repritRowData:{}
// };

// export const loadingSlice = createSlice({
//   name: "loadingSlice",
//   initialState,
//   reducers: {
//     setLoading: (state, actions) => {
//       state.loading = actions.payload;
//     },
//     setReprintLabNo: (state, actions) => {
//       state.reprintLabNo = actions.payload;
//     },
//     setOpenExcelUploadModal: (state, actions) => {
//       state.uploadExcelFileModal = actions.payload;
//     },
//     setImportExcelData: (state, actions) => {
//       state.importExcelData = actions.payload;
//     },
//     setMenuSettingLanguageToggle: (state, actions) => {
//       state.menuSettingLanguage = actions.payload;
//     },
//     setThemeMenuToggle: (state, actions) => {
//       state.themeMenuToggle = actions.payload;
//     },
//     setRateTypeControllerData: (state, actions) => {
//       state.rateTypeControllerData = actions.payload;
//     },
//     setRefLabModalData: (state, actions) => {
//       state.refLabModalData = actions.payload;
//     },
//     setRefDoctorModalData: (state, actions) => {
//       state.refDoctorModalData = actions.payload;
//     },
//     setRefreshLoad: (state, actions) => {
//       state.refreshLoad = actions.payload;
//     },
//     setReprintRowData: (state, actions) => {
//       console.log('actions.payload', actions.payload);
//       state.repritRowData = actions.payload;
//     },
//   },
// });
// export const {
//   setLoading,
//   setReprintLabNo,
//   setOpenExcelUploadModal,
//   setMenuSettingLanguageToggle,
//   setThemeMenuToggle,
//   setRateTypeControllerData,
//   setImportExcelData,
//   setRefLabModalData,
//   setRefDoctorModalData,
//   setRefreshLoad,
//   setReprintRowData,
// } = loadingSlice.actions;
// export default loadingSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { NG_DEFAULT_FONT_FAMILY } from "../../../utils/ngFontFamilies";

const initialState = {
  loading: false,
  reprintLabNo: null,
  uploadExcelFileModal: false,
  importExcelData: [],
  menuSettingLanguage: false,
  themeMenuToggle: false,
  currentTheme: localStorage.getItem("theme") || "default_theme",
  uiMode: useLocalStorage("uiMode", "get") || "classic",
  // NextGen's own light/dark color mode — separate from Classic's uiMode and
  // from the 30-color currentTheme system. Defaults to "light" (white
  // background) per UAT request — previously defaulted to "dark", which is
  // what made NextGen look like it had a non-white background out of the box.
  ngColorMode: useLocalStorage("ngColorMode", "get") || "light",
  // NextGen-only whole-app font family, applied via a CSS custom property
  // (see Header.jsx's sync effect + styles/nextgen/variables.css) — kept
  // client-side/localStorage only, no backend persistence.
  ngFontFamily: useLocalStorage("ngFontFamily", "get") || NG_DEFAULT_FONT_FAMILY,
  designationModalTrigger: 0,
  rateTypeControllerData: [],
  refLabModalData: null,
  refDoctorModalData: null,
  refreshLoad: false,
  repritRowData: {},
};

export const loadingSlice = createSlice({
  name: "loadingSlice",
  initialState,
  reducers: {
    setLoading: (state, actions) => {
      state.loading = actions.payload;
    },
    setReprintLabNo: (state, actions) => {
      state.reprintLabNo = actions.payload;
    },
    setOpenExcelUploadModal: (state, actions) => {
      state.uploadExcelFileModal = actions.payload;
    },
    setImportExcelData: (state, actions) => {
      state.importExcelData = actions.payload;
    },
    setMenuSettingLanguageToggle: (state, actions) => {
      state.menuSettingLanguage = actions.payload;
    },
    setThemeMenuToggle: (state, actions) => {
      state.themeMenuToggle = actions.payload;
    },
    setCurrentTheme: (state, actions) => {
      state.currentTheme = actions.payload;
    },
    setUiMode: (state, actions) => {
      state.uiMode = actions.payload;
    },
    setNgColorMode: (state, actions) => {
      state.ngColorMode = actions.payload;
    },
    setNgFontFamily: (state, actions) => {
      state.ngFontFamily = actions.payload;
    },
    // Incremented (not toggled) so repeated requests always re-trigger the
    // listener in Header.jsx, even if it never got reset in between.
    triggerDesignationModal: (state) => {
      state.designationModalTrigger += 1;
    },
    setRateTypeControllerData: (state, actions) => {
      state.rateTypeControllerData = actions.payload;
    },
    setRefLabModalData: (state, actions) => {
      state.refLabModalData = actions.payload;
    },
    setRefDoctorModalData: (state, actions) => {
      state.refDoctorModalData = actions.payload;
    },
    setRefreshLoad: (state, actions) => {
      state.refreshLoad = actions.payload;
    },
    setReprintRowData: (state, actions) => {
      console.log("actions.payload", actions.payload);
      state.repritRowData = actions.payload;
    },
  },
});

export const {
  setLoading,
  setReprintLabNo,
  setOpenExcelUploadModal,
  setMenuSettingLanguageToggle,
  setThemeMenuToggle,
  setCurrentTheme,
  setUiMode,
  setNgColorMode,
  setNgFontFamily,
  triggerDesignationModal,
  setRateTypeControllerData,
  setImportExcelData,
  setRefLabModalData,
  setRefDoctorModalData,
  setRefreshLoad,
  setReprintRowData,
} = loadingSlice.actions;

export default loadingSlice.reducer;