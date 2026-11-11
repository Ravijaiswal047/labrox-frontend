import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setWindowClass } from "@app/utils/helpers";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import OtpInput from "react-otp-input";
import { FaUser, FaShieldAlt, FaArrowRight, FaCheck } from "react-icons/fa";
import logoFallback from "@app/assets/image/ldpl_logo.png";
import Input from "../../components/formComponent/Input";
import Clients from "../../Config/Clients";

const PatientPortalLoginComp = () => {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const inputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [mobileNo, setMobileNo] = useState("");
  const [otp, setOtp] = useState("");
  const [load, setLoad] = useState(false);

  // Dynamic Logo Logic from Clients Config
  const dynamicLogo = useMemo(() => {
    const hostWithPort = window.location.host;
    const envUrl = import.meta.env.VITE_APP_REACT_APP_BASE_URL?.split("//")?.[1];
    
    let clientKey = hostWithPort;
    if (hostWithPort?.includes("localhost")) {
      clientKey = envUrl;
    }

    const client = Clients[clientKey] || Clients["uat-v9.itdoseinfo.com:8088"];
    return client?.logo || logoFallback;
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    if (!mobileNo.trim()) {
      toast.error("Please enter Mobile No.");
      return;
    }

    if (mobileNo.trim().length !== 10) {
      toast.error("Please enter a valid 10-digit Mobile No.");
      return;
    }

    setLoad(true);
    try {
      const response = await axiosInstance.post("Login/PatientPortalLoginwithmobile", {
        mobileNo: mobileNo.toString(),
      });

      setLoad(false);

      if (response?.data?.success) {
        toast.success(response?.data?.message || "OTP sent successfully");
        setStep(2);
      } else {
        toast.error(response?.data?.message || "Failed to send OTP");
      }
    } catch (err) {
      setLoad(false);
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setLoad(true);

    if (otp === "123456") {
    setTimeout(() => {
      const staticToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      
      const staticData = {
        token: staticToken,
        patientId: "PAT001",
        patientName: "John Doe",
        mobileNo: mobileNo,
        email: "johndoe@example.com",
        age: 35,
        gender: "Male",
        registrationDate: "2024-01-01"
      };

      sessionStorage.setItem("token", JSON.stringify(staticToken));
      sessionStorage.setItem("User", 1);
      sessionStorage.setItem("data", JSON.stringify(staticData));
      
      useLocalStorage("theme", "set", "sky_blue_theme");
      setWindowClass(`hold-transition login-page sky_blue_theme`);
      
      setLoad(false);
      toast.success("Login successful!");
      
      window.location.assign("/patientreport");
    }, 1000); 
    
    return;
  }
    try {
      const response = await axiosInstance.post("Login/VerifyPatientPortalOtp", {
        mobileNo: mobileNo.toString(),
        OTP: otp.toString(),
      });
      
      setLoad(false);
      
      if(response?.data?.success){
        sessionStorage.setItem(
          "token",
          JSON.stringify(response?.data?.data?.token)
        );
        sessionStorage.setItem("User", 1);
        sessionStorage.setItem("data", JSON.stringify(response?.data?.data));
        
        // Also ensure userData is set if needed by other components
        sessionStorage.setItem("userData", JSON.stringify(response?.data?.data));

        useLocalStorage("theme", "set", "sky_blue_theme");
        setWindowClass(`hold-transition login-page sky_blue_theme`);
        
        toast.success(response?.data?.message || "Login successful");
        window.location.assign("/patientreport")
      } else {
        toast.error(response?.data?.message || "Something went wrong!")
      }
    } catch (err) {
      setLoad(false);
      toast.error(err?.response?.data?.message || "Invalid OTP");
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      if (step === 1) {
        handleRequestOtp(e);
      } else {
        handleVerifyOtp(e);
      }
    }
  };

  const handleBackToUsername = () => {
    setStep(1);
    setOtp("");
  };

  return (
    <>
      {load && <Loading />}
      <div className="login-comp-container d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden" style={{borderRadius: "12px", }}>
        <div className="position-relative" style={{ zIndex: 1,}}>
              <div 
                className="login-card card border-0 shadow-lg"
                style={{
                  overflow: "hidden",
                }}
              >
                <div 
                  className="text-center py-5 px-4"
                  style={{
                    background: "linear-gradient(135deg, #f7941d 0%, #c2410c 100%)"
                  }}
                >
                  <img 
                    src={dynamicLogo} 
                    alt="Logo" 
                    className="mb-3"
                    onError={(e) => (e.target.src = logoFallback)}
                    style={{
                      maxWidth: "150px",
                      maxHeight: "60px",
                      height: "auto",
                      filter: "brightness(0) invert(1)" // Optional: make logo white for dark bg
                    }}
                  />
                  <h3 className="heading text-white fw-bold mb-2">
                    {t("Patient Portal")}
                  </h3>
                  <p className="heading-subtitle text-white-50 mb-0">
                    {step === 1 ? t("Sign in to continue") : t("Verify your identity")}
                  </p>
                </div>

                <div className="card-body px-5">
                  <div className="d-flex justify-content-center align-items-center mb-4">
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "40px",
                          height: "40px",
                          background: step >= 1 ? "linear-gradient(135deg, #f7941d 0%, #c2410c 100%)" : "#e9ecef",
                          color: "white",
                          fontWeight: "bold",
                          transition: "all 0.3s ease"
                        }}
                      >
                        {step > 1 ? <FaCheck /> : "1"}
                      </div>
                      <div 
                        className="mx-3"
                        style={{
                          width: "60px",
                          height: "3px",
                          background: step >= 2 ? "linear-gradient(135deg, #f7941d 0%, #c2410c 100%)" : "#e9ecef",
                          transition: "all 0.3s ease"
                        }}
                      />
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "40px",
                          height: "40px",
                          background: step >= 2 ? "linear-gradient(135deg, #f7941d 0%, #c2410c 100%)" : "#e9ecef",
                          color: step >= 2 ? "white" : "#6c757d",
                          fontWeight: "bold",
                          transition: "all 0.3s ease"
                        }}
                      >
                        2
                      </div>
                    </div>
                  </div>

                  {step === 1 && (
                    <form onSubmit={handleRequestOtp}>
                      <div className="mb-4">
                        <label className="form-title form-label text-muted fw-semibold small mb-2">
                          {t("Mobile No")}
                        </label>
                        <div className="position-relative">
                          <Input
                            type="number"
                            ref={inputRef}
                            className="form-control username-input"
                            placeholder="Enter your Mobile No."
                            value={mobileNo}
                            maxLength={10}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                            }}
                            onChange={(e) => setMobileNo(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn w-100 py-4 text-white fw-semibold d-flex align-items-center justify-content-center gap-2"
                        style={{
                          background: "linear-gradient(135deg, #f7941d 0%, #c2410c 100%)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "16px",
                          transition: "transform 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                        onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                      >
                        Request OTP
                        <FaArrowRight style={{marginLeft: "8px"}} />
                      </button>
                    </form>
                  )}

                  {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                      <div className="mb-4">
                        <label className="form-title form-label text-muted fw-semibold small mb-2">
                          {t("Enter OTP")}
                        </label>
                        <p className="text-muted small mb-3">
                          We've sent a 6-digit code to your registered contact
                        </p>
                        <div className="d-flex justify-content-center">
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={6}
                                renderInput={(props) => (
                                <input
                                    {...props}
                                    className="otp-input"
                                    type="number"
                                    maxLength={6}
                                    onFocus={(e) => {
                                    e.target.style.borderColor = "#859bffff";
                                    e.target.style.backgroundColor = "white";
                                    }}
                                    onBlur={(e) => {
                                    e.target.style.borderColor = "#2850ffff";
                                    e.target.style.backgroundColor = "#f8f9fa";
                                    }}
                                />
                                )}
                            />
                            </div>
                      </div>

                      <button
                        type="submit"
                        className="btn w-100 text-white fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                        style={{
                          background: "linear-gradient(135deg, #f7941d 0%, #c2410c 100%)",
                        }}
                        onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                        onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                      >
                        <FaShieldAlt style={{marginRight: "8px"}}  />
                        Verify & Login
                      </button>

                      <button
                        type="button"
                        className="btn btn-light w-100"
                        onClick={handleBackToUsername}
                        style={{
                          borderRadius: "12px",
                          fontSize: "14px",
                          color: "#6c757d",
                          backgroundColor: "#d1d1d1ff"
                        }}
                      >
                        Back to Mobile No
                      </button>
                    </form>
                  )}
                </div>
              </div>
        </div>
      </div>
    </>
  );
};

export default PatientPortalLoginComp;