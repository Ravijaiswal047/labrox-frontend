import React, { useState } from "react";
import { FiEye, FiEyeOff, FiShield, FiActivity, FiDatabase, FiUser } from "react-icons/fi";
import labroxLogo from '../../../assets/image/labrox_logo.png';
import Footer from "../../../layouts/footer/Footer";
import ForgotPassword from "./ForgotPassword";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import AgreementPopup from "../AgreementPopup";
import ForceChangePasswordModal from "../ForceChangePasswordModal";
import "./ItDoseLogin.css";
import { Google } from "../../../assets";

const ItDoseLogin = ({ client }) => {
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
      <ForceChangePasswordModal
        show={showForceChangePassword}
        onSuccess={completeLoginAfterForcedPasswordChange}
        onCancel={cancelForcedPasswordChange}
      />
      {isPopupOpen.isOpen && (
        <AgreementPopup
          isPopupOpen={isPopupOpen}
          closeAgreeDialog={closeAgreeDialog}
          AgreeButtonCheck={AgreeButtonCheck}
        />
      )}

      <div className="login_page">
      {/* Everything except the copyright bar is centered together in this
          wrapper (flex:1, its own justify-content:center) so the copyright
          bar - a sibling after it, not inside it - always lands flush at
          the very bottom of the screen instead of floating with a gap
          under it whenever there's leftover vertical space. */}
      <div className="login_center_wrap">
        <div className="login_card_wrapper">
          <div className="login_card premium_card">
            {/* LEFT SIDE (Animated Content) */}
            <div
              className={`login_card_inner ${
                isRightPanelActive ? "show-forgot" : "show-login"
              }`}
            >
              {/* LOGIN VIEW */}

              <div className="login_view d-flex flex-column align-items-center justify-content-center">
                {/* Set per-domain via Clients.js's `envBadge` (only demov9
                    has it) - sits right above the logo instead of floating
                    in the page corner. */}
                {client?.envBadge && (
                  <div className="env_badge">
                    <span className="env_dot" />
                    {client.envBadge}
                  </div>
                )}

                <img src={client?.logo || labroxLogo} className="login_logo" alt="LabRox" />

                <h2 className="login_title">Welcome Back</h2>
                <p className="login_subtitle">
                  Sign in to continue to LabRox
                </p>

                <form onSubmit={getSubmitHandler} className="w-100">
                  <div className="form_group">
                    <label>Username</label>
                    <div className="input_icon_wrap">
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
                      <span className="field_icon">
                        <FiUser />
                      </span>
                    </div>
                  </div>

                  {loginStep === 2 && (
                    <>
                      {isOtpRequired ? (
                        <>
                        <div className="form_group">
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
                              className="forgot"
                              onClick={() => {}}
                            >
                              Resend OTP?
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                        <div className="form_group">
                          <label>Password</label>
                          <div className="password_wrap">
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
                              className="forgot"
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

                  <button className="login_btn" disabled={loading}>
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
                      className="forgot" 
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
              <div className="forgot_view d-flex flex-column align-items-center justify-content-center">
                <ForgotPassword
                  client={client}
                  onCancel={() => setRightPanelActive(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Slim trust row - replaces the old full-height orange split panel;
            same "Healthcare Secured" message, as a compact strip under the
            card instead of a whole separate colored half of the page. */}
        <div className="trust_row">
          <div className="trust_item">
            <span className="trust_icon"><FiShield /></span>
            Encrypted &amp; secure
          </div>
          <div className="trust_item">
            <span className="trust_icon"><FiActivity /></span>
            Real-time diagnostics
          </div>
          <div className="trust_item">
            <span className="trust_icon"><FiDatabase /></span>
            Centralized records
          </div>
        </div>

        <div className="powered_footer">
          <img src={labroxLogo} alt="LabRox" />
          Powered by <strong>LabRox New Gen Software</strong>
        </div>
      </div>

        <Footer />
      </div>
    </>
  );
};

export default ItDoseLogin;
