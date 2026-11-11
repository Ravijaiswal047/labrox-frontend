import React, { useState, useEffect } from "react";
import ITDOSE from "../assets/image/logoitdose.png";
import "./LdplSmartGateway.css";
import LDPLLOGO from "../assets/image/ldpl_logo.png";
import HDFCLOGO from "../assets/image/HDFClogo.png";
import logo_Razorpay from "../assets/image/logo_Razorpay.png";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/utils";
import { axiosInstance } from "../utils/axiosInstance";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import { logoList } from "../utils/utils";
import VerifyPanelCode from "../Frontend/PaymentGatewayLanding/VerifyPanelCode";

const LdplSmartPaymentGatewaythroughOtp = () => {
  const navigate = useNavigate();
  const userLocalData = useLocalStorage("userData", "get");

  const [payload, setPayload] = useState({
    mobileNumber: "",
    otp: "",
   
  });

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [step, setStep] = useState(1);
   
  
  const [otpValidated, setOtpValidated] = useState(false);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);



     if (step === 3 && otpValidated) {
     return <VerifyPanelCode />;
   }

  
  

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
   
    if (payload.mobileNumber.length !== 10) {
      notify("Please enter a valid 10-digit mobile number", "warn");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("CommonController/PaymentSendOTP", {
        mobileNo: payload.mobileNumber,
        type: "SmsOtpApi",
      });
      if(res.status === 200 && res?.data?.success){
      notify(res?.data?.message );
       setOtpSent(true);
      setTimer(30);
      setStep(2);
      }else{
        notify(res?.data?.message || "Failed to send OTP", "error");
      }
     
    } catch (err) {
      notify(err?.res?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
    e?.preventDefault();

    if (payload.otp.length !== 6) {
      notify("Enter valid 6-digit OTP", "warn");
      return;
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/CommonController/PaymentverifyOTP",
        {
          mobileNo: payload.mobileNumber,
          OTP: payload.otp,
          PageName: "PaymentOTP"
        }
      );

      if (response?.data?.success) {
        notify(response?.data?.message || " OTP Validation successful", "success");
        setStep(3);
        localStorage.setItem(
          "token",
          JSON.stringify(response?.data?.data?.token)
        );
        localStorage.setItem("User", 1);
        localStorage.setItem("data", JSON.stringify(response?.data?.data));
        localStorage.setItem("userData", JSON.stringify(response?.data?.data));
        setOtpValidated(true);

      } else {
        notify(response?.data?.message || "Something went wrong!", "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || "Invalid OTP", "error");


    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      if (!loading && payload.mobileNumber && payload.mobileNumber.length >= 10) {
        handleSendOtp(e);
      }
    } else if (!otpValidated) {
      if (!loading && payload.otp && payload.otp.length >= 6) {
        handleValidateOtp(e);
      }
    }
  };

  const handleResendOtp = async () => {
    setTimer(30);
    setPayload((prev) => ({ ...prev, otp: "" }));
    setLoading(true);
    try {
      const res = await axiosInstance.post("CommonController/PaymentSendOTP", {
        mobileNo: payload.mobileNumber,
        type: "SmsOtpApi",
      });
      notify(res.data.message, "success");
      setStep(2);
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPayload({ mobileNumber: "", otp: "" });
    setOtpSent(false);
    setTimer(0);
    setStep(1);
    setOtpValidated(false);
  };

  return (
    <div className="ldpl-gateway-wrapper">
      <div className="ldpl-gateway-card">

        {/* Company Logo */}
        <div className="ldpl-logo-wrap">
          <img
            src={LDPLLOGO}
            alt="company logo"
            className="ldpl-company-logo"
          />
        </div>

        <hr className="ldpl-divider" />

        {/* Title */}
        <div className="ldpl-title-wrap">
          <h1 className="ldpl-company-name">
            Paying To {userLocalData?.CompanyName || "Your Company"}
          </h1>
          <p className="ldpl-subtitle">Payment Gateway</p>
        </div>

        <h2 className="ldpl-otp-title">Login through OTP</h2>

        <Form onSubmit={handleSubmit}>
          {/* Mobile Number */}
          <Form.Group className="ldpl-form-group">
            <Form.Label className="ldpl-label">Mobile Number:</Form.Label>
            <Form.Control
              className="ldpl-input"
              type="number"
              name="mobileNumber"
              value={payload.mobileNumber}
              onChange={(e) => {
                if (e.target.value.length <= 10) handleInputChange(e);
              }}
              placeholder="Enter 10-digit mobile number"
              disabled={otpSent}
            />
          </Form.Group>

          {/* Send OTP Button */}
          {!otpSent && (
            <button
              type="submit"
              className="ldpl-btn-primary"
              disabled={
                loading ||
                !payload.mobileNumber ||
                payload.mobileNumber.length < 10
              }
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          )}

          {/* OTP Input + Validate */}
          {otpSent && !otpValidated && (
            <>
              <Form.Group className="ldpl-form-group">
                <Form.Label className="ldpl-label">Enter OTP:</Form.Label>
                <Form.Control
                  className="ldpl-input"
                  type="number"
                  name="otp"
                  value={payload.otp}
                  onChange={(e) => {
                    if (e.target.value.length <= 6) handleInputChange(e);
                  }}
                  placeholder="Enter 6-digit OTP"
                />
              </Form.Group>

              <button
                type="submit"
                className="ldpl-btn-primary"
                disabled={loading || !payload.otp || payload.otp.length < 6}
              >
                {loading ? "Validating..." : "Validate OTP"}
              </button>

              {/* Timer + Resend + Reset */}
              <p className="ldpl-timer-text">
                {timer > 0
                  ? `Resend OTP in ${timer}s`
                  : "You can resend OTP now."}
              </p>

              <div className="ldpl-action-row">
                <button
                  type="button"
                  className="ldpl-btn-resend"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || loading}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  className="ldpl-btn-reset"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
              

  
            </>
          )}
     
          {/* Powered by logo */}
          <div className="ldpl-powered-wrap">
            {/* <img src={LDPLLOGO} alt="HDFC" className="ldpl-hdfc-logo" />  */}
            <img src={HDFCLOGO} alt="HDFC" className="ldpl-hdfc-logo" />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LdplSmartPaymentGatewaythroughOtp;













// import React, { useState, useEffect } from "react";
// import HDFCLOGO from "../assets/image/HDFClogo.png";
// import "./LdplSmartGateway.css";
// import { Form } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { notify } from "../utils/utils";
// import { axiosInstance } from "../utils/axiosInstance";
// import { useLocalStorage } from "../utils/hooks/useLocalStorage";
// import { logoList } from "../utils/utils";
// import VerifyPanelCode from "../Frontend/PaymentGatewayLanding/VerifyPanelCode";

// const LdplSmartPaymentGateway = () => {
//   const navigate = useNavigate();
//   const userLocalData = useLocalStorage("userData", "get");

//   const [payload, setPayload] = useState({
//     mobileNumber: "",
//     otp: "",
//   });

//   const [otpSent, setOtpSent] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [step, setStep] = useState(1); // 1=mobile, 2=otp, 3=panel verify
//   const [loading, setLoading] = useState(false);

  
//   useEffect(() => {
//     let interval;
//     if (timer > 0) {
//       interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(interval);
//   }, [timer]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setPayload((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSendOtp = async () => {
//     if (payload.mobileNumber.length !== 10) {
//       notify("Please enter a valid 10-digit mobile number", "warn");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axiosInstance.post("CommonController/PaymentSendOTP", {
//         mobileNo: payload.mobileNumber.toString(),
//         type: "SmsPaymentApi",
//       });
//       notify(res?.data?.message || "OTP sent successfully", "success");
//       setOtpSent(true);
//       setTimer(30);
//       setStep(2); 
//     } catch (err) {
//       notify(err?.response?.data?.message || "Failed to send OTP", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleValidateOtp = async () => {
//     if (payload.otp.length !== 6) {
//       notify("Enter valid 6-digit OTP", "warn");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axiosInstance.post(
//         "/CommonController/PaymentverifyOTP",
//         {
//           mobileNo: payload.mobileNumber,
//           OTP: payload.otp,
//           PageName: "PaymentOTP",
//         }
//       );

//       if (res?.data?.success) {
//         // store auth data
//         localStorage.setItem("token", JSON.stringify(res?.data?.data?.token));
//         localStorage.setItem("User", 1);
//         localStorage.setItem("data", JSON.stringify(res?.data?.data));
//         localStorage.setItem("userData", JSON.stringify(res?.data?.data));

//         notify(res?.data?.message || "OTP verified successfully", "success");
//         setStep(3); // ✅ move to panel verify step
//       } else {
//         notify(res?.data?.message || "OTP verification failed", "error");
//       }
//     } catch (err) {
//       notify(err?.response?.data?.message || "Invalid OTP", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     if (timer > 0) return;
//     setTimer(30);
//     setPayload((prev) => ({ ...prev, otp: "" }));
//     setLoading(true);
//     try {
//       const res = await axiosInstance.post("CommonController/PaymentSendOTP", {
//         mobileNo: payload.mobileNumber,
//         type: "SmsPaymentApi",
//       });
//       notify(res?.data?.message || "OTP resent", "success");
//     } catch (err) {
//       notify(err?.response?.data?.message || "Failed to resend OTP", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setPayload({ mobileNumber: "", otp: "" });
//     setOtpSent(false);
//     setTimer(0);
//     setStep(1); // ✅ back to mobile step
//   };


//   if (step === 3) {
//     return <VerifyPanelCode />;
//   }

//   return (
//     <div className="ldpl-gateway-wrapper">
//       <div className="ldpl-gateway-card">

//         {/* Company Logo */}
//         <div className="ldpl-logo-wrap">
//           <img
//             src={
//               logoList?.[userLocalData?.CompanyID] ||
//               `https://elabassets.s3.ap-south-1.amazonaws.com/${userLocalData?.ImageLogo}`
//             }
//             alt="company logo"
//             className="ldpl-company-logo"
//           />
//         </div>

//         <hr className="ldpl-divider" />

//         {/* Title */}
//         <div className="ldpl-title-wrap">
//           <h1 className="ldpl-company-name">
//             Paying To {userLocalData?.CompanyName || "Your Company"}
//           </h1>
//           <p className="ldpl-subtitle">Payment Gateway</p>
//         </div>

//         <h2 className="ldpl-otp-title">Login through OTP</h2>

//         {/* Step indicator */}
//         {/* <div className="ldpl-steps">
//           <span className={`ldpl-step ${step >= 1 ? "active" : ""}`}>1. Mobile</span>
//           <span className="ldpl-step-sep">›</span>
//           <span className={`ldpl-step ${step >= 2 ? "active" : ""}`}>2. OTP</span>
//           <span className="ldpl-step-sep">›</span>
//           <span className={`ldpl-step ${step >= 3 ? "active" : ""}`}>3. Verify</span>
//         </div> */}

//         <Form onSubmit={handleSubmit}>
//           {/* ── STEP 1: Mobile Number ── */}
//           {step === 1 && (
//             <>
//               <Form.Group className="ldpl-form-group">
//                 <Form.Label className="ldpl-label">Mobile Number:</Form.Label>
//                 <Form.Control
//                   className="ldpl-input"
//                   type="number"
//                   name="mobileNumber"
//                   value={payload.mobileNumber}
//                   onChange={(e) => {
//                     if (e.target.value.length <= 10) handleInputChange(e);
//                   }}
//                   placeholder="Enter 10-digit mobile number"
//                 />
//               </Form.Group>
//               <button
//                 type="button"
//                 className="ldpl-btn-primary"
//                 onClick={handleSendOtp}
//                 disabled={
//                   loading ||
//                   !payload.mobileNumber ||
//                   payload.mobileNumber.length < 10
//                 }
//               >
//                 {loading ? "Sending..." : "Send OTP"}
//               </button>
//             </>
//           )}

//           {/* ── STEP 2: OTP ── */}
//           {step === 2 && (
//             <>
//               {/* show mobile as readonly reference */}
//               <div className="ldpl-mobile-ref">
                
                
//                 {/* <button
//                   type="button"
//                   className="ldpl-change-btn"
//                   onClick={handleReset}
//                 >
//                   Change
//                 </button> */}
//               </div>

//               <Form.Group className="ldpl-form-group">
//                 <Form.Label className="ldpl-label">Enter OTP:</Form.Label>
//                 <Form.Control
//                   className="ldpl-input"
//                   type="number"
//                   name="otp"
//                   value={payload.otp}
//                   onChange={(e) => {
//                     if (e.target.value.length <= 6) handleInputChange(e);
//                   }}
//                   placeholder="Enter 6-digit OTP"
//                   autoFocus
//                 />
//               </Form.Group>

//               <button
//                 type="button"
//                 className="ldpl-btn-primary"
//                 onClick={handleValidateOtp}
//                 disabled={loading || !payload.otp || payload.otp.length < 6}
//               >
//                 {loading ? "Validating..." : "Validate OTP"}
//               </button>

//               <p className="ldpl-timer-text">
//                 {timer > 0
//                   ? `Resend OTP in ${timer}s`
//                   : "You can resend OTP now."}
//               </p>

//               <div className="ldpl-action-row">
//                 <button
//                   type="button"
//                   className="ldpl-btn-resend"
//                   onClick={handleResendOtp}
//                   disabled={timer > 0 || loading}
//                 >
//                   Resend OTP
//                 </button>
//                 <button
//                   type="button"
//                   className="ldpl-btn-reset"
//                   onClick={handleReset}
//                 >
//                   Reset
//                 </button>
//               </div>
//             </>
//           )}

//           {/* Powered by HDFC */}
//           <div className="ldpl-powered-wrap">
//             <img src={HDFCLOGO} alt="HDFC" className="ldpl-hdfc-logo" />
//           </div>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default LdplSmartPaymentGateway;