
import React, { useState } from "react";
import "./OliveLoginPage.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import ForceChangePasswordModal from "../ForceChangePasswordModal";
import ForgotPassword from "./ForgotPassword";
import loginImage from '../../../assets/image/login-bg.png'
import LoginLogo from '../../../assets/image/oliv-logo.png'
import labroxLogo from '../../../assets/image/labrox_logo.png';
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import Footer from "../../../layouts/footer/Footer";
import OTPInput from "../../../components/UI/OTPInput";

const OliveLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [t] = useTranslation();
  const {
    credentials,
    handleChange,
    handleSubmit,
    loading,
    isRightPanelActive,
    setRightPanelActive,
    showForceChangePassword,
    completeLoginAfterForcedPasswordChange,
    cancelForcedPasswordChange,
  } = useLoginLogic();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login_wrapper">
      <ForceChangePasswordModal show={showForceChangePassword} onSuccess={completeLoginAfterForcedPasswordChange} onCancel={cancelForcedPasswordChange} />
      <div className="oliv_login_main">
       <div>
         {isRightPanelActive ? (
          <ForgotPassword onCancel={() => setRightPanelActive(false)} />
        ) : (
        <>
          <div className="login_form_section">
            <div className="login_form">
              <div className="form_container">
                <a href="#" className="login_logo_link">
                  {/* <img
                    src={LoginLogo}
                    alt="Logo"
                    className="login_logo"
                  /> */}
                </a>

                <h3 className="login_heading">Welcome back!</h3>

                <form onSubmit={handleSubmit}>
                  <div className="form_group">
                    <label htmlFor="username" className="form_label">
                      Username <span className="text_danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="form_control"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* <div className="form_group mt-2">
                    <label htmlFor="password" className="form_label">
                      OTP 
                    </label>
                    <OTPInput numInputs={6}/>
                  </div> */}

                  <div className="form_group">
                    <label htmlFor="password" className="form_label">
                      Password <span className="text_danger">*</span>
                    </label>
                    <div className="position_relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className="form_control"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={handleChange}
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
                    id="oliv_login_button"
                    disabled={loading}
                    // style={{backgroundColor: }}
                  >
                    {loading ? "Signing in..." : "Login"}
                  </button>
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
                {/* <img src={labroxLogo} alt="LabRox" /> */}
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
       <footer className="oliv_login_powered_footer">
         <span className="powered_badge">
           {/* <img src={labroxLogo} alt="LabRox" /> */}
           Powered by <strong>LabRox New Gen Software</strong>
         </span>
       </footer>

       {/* Copyright footer with divider */}
       {/* <footer className="login_copyright_footer">
         <span>
           &copy; {DateTime.now().toFormat("yyyy")} <a href="https://www.itdoseinfo.com" target="_blank" rel="noopener noreferrer">LabRox New Gen Software</a>
         </span>
       </footer> */}
       <Footer/>
      </div>
      
    </div>
  );
};

export default OliveLoginPage;
