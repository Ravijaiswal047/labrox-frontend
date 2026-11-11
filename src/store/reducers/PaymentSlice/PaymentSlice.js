import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paymentMethodModal: false,
  paymentMethodOptions: null,
  openHdfcPaymentModal: false,
  openRazorPayPaymentModal: false,
  openIciciPaymentModal: false,
};

export const PaymentSlice = createSlice({
  name: "PaymentSlice",
  initialState,
  reducers: {
    setPaymentMethodModal: (state, action) => {
      state.paymentMethodModal = action.payload;
    },
    setOpenHdfcPaymentModal: (state, action) => {
      state.openHdfcPaymentModal = action.payload;
    },
    setOpenRazorPayPaymentModal: (state, action) => {
      state.openRazorPayPaymentModal = action.payload;
    },
    setOpenIciciPaymentModal: (state, action) => {
      state.openIciciPaymentModal = action.payload;
    },
  },
});

export const {
  setPaymentMethodModal,
  setOpenRazorPayPaymentModal,
  setOpenHdfcPaymentModal,
  setOpenIciciPaymentModal,
} = PaymentSlice.actions;
export default PaymentSlice.reducer;
