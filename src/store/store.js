import { configureStore } from "@reduxjs/toolkit";
import { uiSlice } from "@app/store/reducers/ui";

import {
  authSlice,
  loadingSlice,
  balaceSlice,
  byPassauthSlice,
  submenuSlice,
  pageControlsSlice,
  fileUploadSlice,
  TicketingModuleSlice,
  CombinedRateTypeSlice,
  eqasSlice,
  PaymentSlice,
} from "./reducers";
// import logger from "redux-logger";

const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    authSlice: authSlice,
    loadingSlice: loadingSlice,
    balaceSlice: balaceSlice,
    byPassauthSlice: byPassauthSlice,
    submenuSlice: submenuSlice,
    pageControlsSlice: pageControlsSlice,
    fileUploadSlice: fileUploadSlice,
    ticketing:TicketingModuleSlice,
    CombinedRateTypeSlice: CombinedRateTypeSlice,
    eqasSlice:eqasSlice,
    PaymentSlice: PaymentSlice,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({ serializableCheck: false }).concat(logger),
});

export default store;
