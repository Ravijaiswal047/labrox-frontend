import React, { useState, useEffect } from "react";
import HDFCLOGO from "../../assets/image/HDFCLOGO_new.png";
import "./Gateway.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import logo_Razorpay from "../../assets/image/logo_Razorpay.png";
import { useNavigate } from "react-router-dom";
import { notify } from "../../utils/utils";
import { axiosInstance } from "../../utils/axiosInstance";

const LoginWithOtp = () => {
  const navigate = useNavigate();
  const [payload, setPayload] = useState({
    mobileNumber: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpValidated, setOtpValidated] = useState(false);

  // countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (payload.mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    await axiosInstance.post('CommonController/PaymentSendOTP', {
      mobileNo: payload.mobileNumber,
      type: "SmsPaymentApi"
    })
      .then(res => {
        console.log('res.data.message:::', res.data.message);
        notify(res.data.message);
        console.log("Sending OTP to:", payload.mobileNumber);
        setOtpSent(true);
        setTimer(30);
      })
      .catch(err => {
        console.log(err);
        notify(err.response.data.message, 'error');
      })
  };

  const handleValidateOtp = () => {
    if (payload.otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }
    axiosInstance.post(`/CommonController/PaymentverifyOTP`, {
      mobileNo: payload.mobileNumber,
      otp: payload.otp,
      pageName: "PaymentOTP"
    })
      .then(res => {
        notify(res.data.message, 'success');
        setOtpValidated(true);
        navigate("/paymanet-gatway/verifyGateway");
      })
      .catch(err => {
        console.log(err);
        notify(err.response.data.message, 'error');
      })
  };

  const handleResendOtp = () => {
    setTimer(30);
    setPayload((prev) => ({ ...prev, otp: "" }));
  };

  return (
    <div className="p-2 ieoi d-flex align-items-center h-100vh align-items-center justify-content-center">
      <div className="card payment_container p-3">
        <img className="mx-auto" src={HDFCLOGO} alt="HDFCLOGO" />

        <hr className="my-2" />
        <h1 className="health_title text-red d-flex flex-column align-items-center justify-content-center">
          <span>Paying To Olivhealth Path Lab</span>
          <span>Payment Gateway</span>
        </h1>
        <h2 className="text-center center_title">Login through OTP</h2>
        <Form>
          {/* Mobile Number Input */}
          <Form.Group
            as={Row}
            className="mb-2 d-flex flex-column align-items-center justify-content-center"
          >
            <Form.Label className="pb-0" column sm="12">
              Mobile Number:
            </Form.Label>
            <Col sm="12">
              <Form.Control
                type="number"
                name="mobileNumber"
                value={payload.mobileNumber}
                onChange={(e) => {
                  if (e.target.value.length <= 10) handleInputChange(e);
                }}
                placeholder="Enter 10-digit mobile number"
                disabled={otpSent} // disable after OTP is sent
              />
            </Col>
          </Form.Group>
          {!otpSent && (
            <Button
              variant="primary"
              className="rounded px-3 py-3 w-100"
              onClick={handleSendOtp}
              disabled={
                !payload.mobileNumber || payload.mobileNumber.length < 10
              }
            >
              Send OTP
            </Button>
          )}

          {/* OTP Input */}
          {otpSent && !otpValidated && (
            <>
              <Form.Group as={Row} className="mb-2">
                <Form.Label className="pb-0" column sm="12">
                  Enter OTP:
                </Form.Label>
                <Col sm="12">
                  <Form.Control
                    type="number"
                    name="otp"
                    value={payload.otp}
                    onChange={(e) => {
                      if (e.target.value.length <= 6) handleInputChange(e);
                    }}
                    placeholder="Enter 6-digit OTP"
                  />
                </Col>
              </Form.Group>
              <Button
                variant="primary"
                className="rounded mb-3 px-3 py-3 w-100"
                onClick={handleValidateOtp}
                disabled={!payload.otp || payload.otp.length < 6}
              >
                Validate OTP
              </Button>

              {/* Resend OTP with Timer */}
              <p className="otp_para">
                {timer > 0
                  ? `You can resend OTP after ${ timer } seconds`
                  : "You can resend OTP now."}
              </p>
              <div
                style={{ gap: "4px" }}
                className="d-flex justify-content-center gap-3"
              >
                <button
                  type="button"
                  className="btn-resend"
                  onClick={handleResendOtp}
                  disabled={timer > 0}
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  className="btn-reset"
                  onClick={() => {
                    setPayload({ mobileNumber: "", otp: "" });
                    setOtpSent(false);
                    setTimer(0);
                    setOtpValidated(false);
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {/* Razorpay Logo */}
          <Col sm="12" className="d-flex justify-content-center mt-3">
            <img className="mx-auto" src={logo_Razorpay} alt="Razorpay" />
          </Col>
        </Form>
      </div>
    </div>
  );
};

export default LoginWithOtp;
