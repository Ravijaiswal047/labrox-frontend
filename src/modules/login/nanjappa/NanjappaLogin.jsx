import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import labroxLogo from '../../../assets/image/labrox_logo.png';
import nanjappaLogo from "../../../assets/image/nanjappa.jpg";
import Footer from "../../../layouts/footer/Footer";
import ForgotPassword from "./ForgotPassword";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import ForceChangePasswordModal from "../ForceChangePasswordModal";
import AgreementPopup from "../AgreementPopup";
import "./NanjappaLogin.css";

const NanjappaLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    credentials,
    setLoginStep,
    isOtpRequired,
    loginStep,
    handleChange,
    handleCheckUser,
    handleSubmit,
    handleOtpSubmit,
    loading,
    isRightPanelActive,
    setRightPanelActive,
    isPopupOpen,
    closeAgreeDialog,
    AgreeButtonCheck,
    showForceChangePassword,
    completeLoginAfterForcedPasswordChange,
    cancelForcedPasswordChange,
    // loginWithGoogle,
  } = useLoginLogic();

  const getSubmitHandler = (e) => {
  if (loginStep === 1) return handleCheckUser(e);
  if (isOtpRequired) return handleOtpSubmit(e);
  return handleSubmit(e);
};

  return (
    <>
      <ForceChangePasswordModal show={showForceChangePassword} onSuccess={completeLoginAfterForcedPasswordChange} onCancel={cancelForcedPasswordChange} />
      {isPopupOpen.isOpen && (
        <AgreementPopup
          isPopupOpen={isPopupOpen}
          closeAgreeDialog={closeAgreeDialog}
          AgreeButtonCheck={AgreeButtonCheck}
        />
      )}

      <div className="nanjappa_login_page">
        <div className="nanjappa_login_card_wrapper">
          <div className="nanjappa_login_card premium_card">
            {/* LEFT SIDE (Animated Content) */}
            <div
              className={`nanjappa_login_card_inner ${
                isRightPanelActive ? "nanjappa_show-forgot" : "nanjappa_show-login"
              }`}
            >
              {/* LOGIN VIEW */}
              
              <div className="nanjappa_login_view d-flex flex-column align-items-center justify-content-center">
                <img src={nanjappaLogo} className="nanjappa_login_logo" alt="LabRox" />

                <h2 className="nanjappa_login_title">Welcome Back</h2>
                <p className="nanjappa_login_subtitle">
                  Sign in to continue to itDose
                </p>

                <form onSubmit={getSubmitHandler} className="w-100">
                  <div className="nanjappa_form_group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                      disabled={loginStep === 2}
                      className={loginStep === 2 ? "readonly-input" : ""}
                      autoComplete="off"
                    />
                  </div>

                  {loginStep === 2 && (
                    <>
                      {isOtpRequired ? (
                        <>
                        <div className="nanjappa_form_group">
                          <label>OTP</label>
                          <input
                            type="text"
                            name="OTP"
                            value={credentials.OTP}
                            onChange={handleChange}
                            placeholder="Enter OTP sent to your mobile"
                            required
                            autoComplete="off"
                          />
                        </div>
                        <div 
                        // className="form_meta"
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: "10px",
                        }}
                        >
                            {/* <label className="remember">
                              <input 
                                type="checkbox" 
                                name="RememberMe" 
                                value={credentials.RememberMe} 
                                onChange={handleChange} 
                                /> 
                                Remember me
                            </label> */}
                            <span
                              className="nanjappa_forgot"
                              onClick={() => {}}
                            >
                              Resend OTP?
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                        <div className="nanjappa_form_group">
                          <label>Password</label>
                          <div className="nanjappa_password_wrap">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={credentials.password}
                              onChange={handleChange}
                              placeholder="Enter password"
                              required
                              autoComplete="off"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FiEye /> : <FiEyeOff />}
                            </button>
                          </div>
                        </div>
                           <div className="" style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginBottom: "10px",
                            }}
                           >
                            {/* <label className="remember">  
                              <input 
                                type="checkbox" 
                                name="RememberMe" 
                                value={credentials.RememberMe} 
                                onChange={handleChange} 
                                /> 
                                Remember me
                            </label> */}
                            <span
                              className="nanjappa_forgot"
                              onClick={() => setRightPanelActive(true)}
                            >
                              Forgot password?
                            </span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {/* {(loginStep === 2 && !isOtpRequired) && (
                    
                  )} */}

                  <button className="nanjappa_login_btn" disabled={loading}>
                    {loading 
                      ? "Processing..." 
                      : loginStep === 1 
                        ? "Next" 
                        : "Login"}
                  </button>
                  {/* {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                  <button 
                    className="google_btn" 
                    disabled={loading}
                    onClick={loginWithGoogle}
                  >

                    <img src={Google} alt="Google" width={20} className="mr-3" /> Continue with Google
                  </button>
                  )} */}
                  {loginStep === 2 && (
                  <div className="text-end mb-2 mt-2">
                    <span 
                      className="nanjappa_forgot" 
                      style={{ fontSize: '12px', cursor: 'pointer' }}
                      onClick={() => setLoginStep(1)}
                    >
                      Change Username?
                    </span>
                  </div>
                  )}
                </form>
              </div>

              {/* FORGOT VIEW */}
              <div className="nanjappa_forgot_view d-flex flex-column align-items-center justify-content-center">
                <ForgotPassword
                  onCancel={() => setRightPanelActive(false)}
                />
              </div>
            </div>

            {/* RIGHT BRAND PANEL (STATIC) */}
            <div className="nanjappa_login_card_right">
              {/* <div className="nanjappa_brand_content"> */}
                {/* <h3>Healthcare Secured</h3>
                <p>
                  Advanced diagnostics, patient records & lab systems
                  integrated securely.
                </p> */}
              {/* </div> */}
            </div>
          </div>
        </div>

        <div className="nanjappa_powered_footer">
          <img src={labroxLogo} alt="logo" />
          Powered by <strong>LabRox New Gen Software</strong>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default NanjappaLogin;
