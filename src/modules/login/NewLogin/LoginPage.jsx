
import React, { useRef, useState } from "react";
import "./LoginPage.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginLogic } from "./useLoginLogic";
import ForgotPassword from "./ForgotPassword";
import loginImage from '../../../assets/image/NewLoginPage/image.png'
import LoginLogo from '../../../assets/image/NewLoginPage/logo.png'
import labroxLogo from '../../../assets/image/labrox_logo.png';
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import Footer from "../../../layouts/footer/Footer";
import AgreementPopup from "../AgreementPopup";
import ForceChangePasswordModal from "../ForceChangePasswordModal";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [t] = useTranslation();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const otpRef = useRef(null);
  const {
    credentials,
    handleChange,
    handleSubmit,
    loading,
    isRightPanelActive,
    setRightPanelActive,
    isPopupOpen,
    closeAgreeDialog,
    AgreeButtonCheck,
    loginStep,
    setLoginStep,
    isOtpRequired,
    handleCheckUser,
    handleOtpSubmit,
    showForceChangePassword,
    completeLoginAfterForcedPasswordChange,
    cancelForcedPasswordChange,
  } = useLoginLogic();

  const getSubmitHandler = (e) => {
    // Safari's native autofill/QuickType bar can fill an input's value
    // without firing the input/change event React relies on, leaving
    // `credentials` state empty even though the field shows a value. Reading
    // straight from the DOM at submit time sidesteps that and always
    // reflects what's actually in the field.
    const overrides = {
      username: usernameRef.current?.value,
      password: passwordRef.current?.value,
      OTP: otpRef.current?.value,
    };
    if (loginStep === 1) return handleCheckUser(e, overrides);
    if (isOtpRequired) return handleOtpSubmit(e, overrides);
    return handleSubmit(e, overrides);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
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
    <div className="login_wrapper">
      <div className="ldpl_login_main">
       <div>
         {isRightPanelActive ? (
          <ForgotPassword onCancel={() => setRightPanelActive(false)} />
        ) : (
        <>
          <div className="login_form_section">
            <div className="login_form">
              <div className="form_container">
                <a href="#" className="login_logo_link">
                  <img
                    src={LoginLogo}
                    alt="Logo"
                    className="login_logo"
                  />
                </a>

                <h3 className="login_heading">Welcome back</h3>

                <form onSubmit={getSubmitHandler}>
                  <div className="form_group">
                    <label htmlFor="username" className="form_label">
                      Username <span className="text_danger">*</span>
                    </label>
                    <input
                      ref={usernameRef}
                      type="text"
                      id="username"
                      name="username"
                      className="form_control"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={handleChange}
                      autoComplete="username"
                      required
                      disabled={loginStep === 2}
                    />
                  </div>

                  {loginStep === 2 && (
                    <>
                      {isOtpRequired ? (
                        <div className="form_group">
                          <label htmlFor="OTP" className="form_label">
                            OTP <span className="text_danger">*</span>
                          </label>
                          <input
                            ref={otpRef}
                            type="text"
                            id="OTP"
                            name="OTP"
                            className="form_control"
                            placeholder="Enter OTP sent to your mobile"
                            value={credentials.OTP}
                            onChange={handleChange}
                            autoComplete="one-time-code"
                            required
                          />
                        </div>
                      ) : (
                        <div className="form_group">
                          <label htmlFor="password" className="form_label">
                            Password <span className="text_danger">*</span>
                          </label>
                          <div className="position_relative">
                            <input
                              ref={passwordRef}
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              className="form_control"
                              placeholder="Enter your password"
                              value={credentials.password}
                              onChange={handleChange}
                              autoComplete="current-password"
                              required
                            />
                            <button
                              type="button"
                              className="toggle_password"
                              onClick={togglePassword}
                            >
                              {showPassword ? (
                                <FiEye className="password_icon" />
                              ) : (
                                <FiEyeOff className="password_icon" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Remember me + Forgot password */}
                  <div className="form_footer">
                    <div className="remember_me">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        className="form_check_input"
                      />
                      <label htmlFor="rememberMe">Remember me</label>
                    </div>
                    <a
                      href="#"
                      className="forgot_link"
                      onClick={() => setRightPanelActive(true)}
                    >
                      Forgot password?
                    </a>
                  </div>
                    
                  <button
                    type="submit"
                    className="btn_primary"
                    id="ldpl_login_button"
                    disabled={loading}
                  >
                    {loading 
                      ? "Processing..." 
                      : loginStep === 1 
                        ? "Next" 
                        : "Login"}
                  </button>
                  {loginStep === 2 && (
                    <div className="text-end mb-2 mt-2">
                      <span 
                        className="forgot_link" 
                        style={{ fontSize: '12px', cursor: 'pointer' }}
                        onClick={() => setLoginStep(1)}
                      >
                        Change Username?
                      </span>
                    </div>
                  )}
                </form>

                {/* <p className="signup_text">
                  Don’t have an account?{" "}
                  <a href="#" className="signup_link">
                    Sign up here
                  </a>
                </p> */}
              </div>
            </div>
              <footer className="d-block d-md-none mt-5">
              <span className="powered_badge">
                <img src={labroxLogo} alt="LabRox" />
                Powered by <strong>LabRox New Gen Software</strong>
              </span>
            </footer>
          </div>

          <div className="banner_section">
            <img src={loginImage} alt="loginImage" />
          </div>
        </>
        )}
       </div>
       {/* Powered by badge */}
       <footer className="login_powered_footer">
         <span className="powered_badge">
           {/* <img src={labroxLogo} alt="LabRox" /> */}
           Powered by <strong>LabRox New Gen Software</strong>
         </span>
       </footer>
       <Footer/>
      </div>
      
    </div>
    </>
  );
};

export default LoginPage;
