import { default as authSlice } from "./loginSlice/loginSlice";
import { default as loadingSlice } from "./loadingSlice/loadingSlice";
import { default as balaceSlice } from "./ApiSlice/balanceSlice";
import { default as byPassauthSlice } from "./authSlice/authSlice";
import { default as submenuSlice } from "./submenuSlice";
import { default as pageControlsSlice } from "./pageControls/pageControlsSlice";
import fileUploadSlice from "./fileUploadSlice/fileUploadSlice"
import TicketingModuleSlice from './TicketingModuleSlice/TicketingModuleSlice'
import CombinedRateTypeSlice from './CombinedRateTypeSlice/CombinedRateTypeSlice'
import eqasSlice from './eqasSlice/eqasSlice'
import PaymentSlice from './PaymentSlice/PaymentSlice'

export {
  authSlice,
  loadingSlice,
  balaceSlice,
  byPassauthSlice,
  submenuSlice,
  TicketingModuleSlice,
  pageControlsSlice,
  fileUploadSlice,
  CombinedRateTypeSlice,
  eqasSlice,
  PaymentSlice,
};
