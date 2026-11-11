import React, { useState } from "react";
import "./PaymentModal.css";
import { useDispatch, useSelector } from "react-redux";
import {
  setOpenHdfcPaymentModal,
  setOpenRazorPayPaymentModal,
  setOpenIciciPaymentModal,
  setPaymentMethodModal,
} from "../../store/reducers/PaymentSlice/PaymentSlice";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import razorpay from "../../assets/image/razorpay.svg";
import hdfcPayIcon from "../../assets/image/hdfcPayIcon.png";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { notify } from "../../utils/utils";

const PaymentMethodModal = () => {
  const dispatch = useDispatch();
  const userData = useLocalStorage("userData", "get");
  const IsRazorPayGateway = userData?.IsRazorPayGateway == 1;
  const IsHdfcPayGateway = userData?.IsHdfcPayGateway == 1;
  const IsIciciPayGateway = userData?.IsIciciPayGateway == 1;
  const { paymentMethodModal } = useSelector((state) => state.PaymentSlice);
  const activeCount = [IsRazorPayGateway, IsHdfcPayGateway, IsIciciPayGateway].filter(Boolean).length;
  const [selectedMethod, setSelectedMethod] = useState("");

  const handleClose = () => {
    dispatch(setPaymentMethodModal(false));
  };

  const handleOpen = () => {
    if (activeCount === 0) {
      notify("Payment Gateway Not Active!", "warn");
      return;
    }
    if (activeCount === 1) {
      if (IsRazorPayGateway) dispatch(setOpenRazorPayPaymentModal(true));
      if (IsHdfcPayGateway) dispatch(setOpenHdfcPaymentModal(true));
      if (IsIciciPayGateway) dispatch(setOpenIciciPaymentModal(true));
      return;
    }
    dispatch(setPaymentMethodModal(true));
  };

  const handleProceed = () => {
    if (!selectedMethod) {
      alert("Please select a payment method!");
      return;
    }
    if (selectedMethod === "hdfcpay") dispatch(setOpenHdfcPaymentModal(true));
    if (selectedMethod === "razorpay") dispatch(setOpenRazorPayPaymentModal(true));
    if (selectedMethod === "icicipay") dispatch(setOpenIciciPaymentModal(true));
    dispatch(setPaymentMethodModal(false));
  };

  return (
    <>
      <div className="d-flex align-items-center mx-1">
        <span
          onClick={handleOpen}
          className="paymentImage d-flex align-items-center"
        >
          <i className="bi bi-wallet mb-0 mx-1"></i>
          Pay
        </span>
      </div>



      <Modal
        show={paymentMethodModal}
        onHide={handleClose}
        centered
        animation={true}
      >
        {/* <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Choose Payment Method</Modal.Title>
        </Modal.Header> */}

        <Modal.Body className="payment-options-body">
          <div className="border-bottom">
            <h2>Choose Payment Method</h2>
          </div>

          {IsRazorPayGateway && (
            <div
              className={`payment-option-card ${selectedMethod === "razorpay" ? "active-option" : ""}`}
              onClick={() => setSelectedMethod("razorpay")}
            >
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === "razorpay"}
                onChange={() => setSelectedMethod("razorpay")}
              />
              <div className="option-details">
                <img height={30} src={razorpay} alt="razorpay" />
              </div>
            </div>
          )}

          {IsHdfcPayGateway && (
            <div
              className={`payment-option-card ${selectedMethod === "hdfcpay" ? "active-option" : ""}`}
              onClick={() => setSelectedMethod("hdfcpay")}
            >
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === "hdfcpay"}
                onChange={() => setSelectedMethod("hdfcpay")}
              />
              <div className="option-details hdfc_font d-flex align-items-center">
                <img width={30} height={30} src={hdfcPayIcon} alt="hdfcPayIcon" />
                <h6 className="mb-1">HDFC Pay</h6>
              </div>
            </div>
          )}

          {IsIciciPayGateway && (
            <div
              className={`payment-option-card ${selectedMethod === "icicipay" ? "active-option" : ""}`}
              onClick={() => setSelectedMethod("icicipay")}
            >
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === "icicipay"}
                onChange={() => setSelectedMethod("icicipay")}
              />
              <div className="option-details d-flex align-items-center gap-2">
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#f15a22",
                    fontFamily: "Arial, sans-serif",
                    letterSpacing: 1,
                  }}
                >
                  ICICI
                </span>
                <h6 className="mb-0">ICICI Pay</h6>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary"  className="rounded bg-color-container" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="rounded bg-color-container"
            onClick={handleProceed}
          >
            Proceed to Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PaymentMethodModal;
