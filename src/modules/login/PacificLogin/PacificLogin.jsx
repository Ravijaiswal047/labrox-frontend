import React, { useState } from "react";
import { FiEye, FiEyeOff, FiUser, FiLock, FiPhone, FiKey, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import ForceChangePasswordModal from "../ForceChangePasswordModal";
import loginImage from '../../../assets/image/pacific_bg.png';
import LoginLogo from '../../../assets/image/pacific_logo.png';
import labroxLogo from '../../../assets/image/labrox_logo.png';
import { useTranslation } from "react-i18next";
import Footer from "../../../layouts/footer/Footer";
import AgreementPopup from "../AgreementPopup";
import "./PacificLogin.css"

const PacificLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [t] = useTranslation();
  
  const {
    credentials,
    handleChange,
    handleSubmit,
    handleForget,
    handleReset,
    loading,
    isRightPanelActive,
    setRightPanelActive,
    isForgot,
    isPopupOpen,
    closeAgreeDialog,
    AgreeButtonCheck,
    showForceChangePassword,
    completeLoginAfterForcedPasswordChange,
    cancelForcedPasswordChange,
  } = useLoginLogic();

  const togglePassword = (field) => {
    if (field === 'main') setShowPassword(!showPassword);
    else if (field === 'new') setShowNewPassword(!showNewPassword);
    else setShowConfirmPassword(!showConfirmPassword);
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
      
      <div className="pacific-login-wrapper">
        <div className="pacific-login-container">
          {/* Left Section - Form */}
          <div className={`pacific-form-section ${isRightPanelActive ? 'slide-in' : ''}`}>
            <div className="pacific-form-content">
              {!isRightPanelActive ? (
                // Login Form
                <>
                  <div className="pacific-logo-section">
                    <img src={LoginLogo} alt="Logo" className="pacific-logo-img" />
                    <h1 className="pacific-brand-title">Welcome Back!</h1>
                    <p className="pacific-brand-subtitle">Sign in to continue to your account</p>
                  </div>

                  <form onSubmit={handleSubmit} className="pacific-login-form">
                    <div className="pacific-input-group">
                      <label htmlFor="username" className="pacific-input-label">
                        Username <span className="pacific-required">*</span>
                      </label>
                      <div className="pacific-input-wrapper">
                        <FiUser className="pacific-input-icon" />
                        <input
                          type="text"
                          id="username"
                          name="username"
                          className="pacific-form-input"
                          placeholder="Enter your username"
                          value={credentials.username}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="pacific-input-group">
                      <label htmlFor="password" className="pacific-input-label">
                        Password <span className="pacific-required">*</span>
                      </label>
                      <div className="pacific-input-wrapper">
                        <FiLock className="pacific-input-icon" />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          className="pacific-form-input"
                          placeholder="Enter your password"
                          value={credentials.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="pacific-toggle-password"
                          onClick={() => togglePassword('main')}
                        >
                          {showPassword ? <FiEye /> : <FiEyeOff />}
                        </button>
                      </div>
                    </div>

                    <div className="pacific-form-footer">
                      <label className="pacific-checkbox-container">
                        <input type="checkbox" id="rememberMe" />
                        <span className="pacific-checkbox-label">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="pacific-forgot-link"
                        onClick={() => setRightPanelActive(true)}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="pacific-btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="pacific-loader-text">Signing in...</span>
                      ) : (
                        <>
                          <span>Login</span>
                          <FiArrowRight className="pacific-btn-icon" />
                        </>
                      )}
                    </button>
                  </form>
                  <footer className="pacific-powered-footer">
                    <span className="pacific-powered-text">
                        <img src={labroxLogo} alt="itDose Logo" className="pacific-powered-logo" />
                        Powered by <strong>LabRox New Gen Software</strong>
                    </span>
                    <a
                      href="https://pacificonehealth.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pacific-terms-link mt-3"
                    >
                      Click here to refer the terms &amp; conditions and other policies.
                    </a>
                  </footer>
                </>
              ) : (
                // Forgot Password Form
                <>
                  <div className="pacific-logo-section">
                    <img src={LoginLogo} alt="Logo" className="pacific-logo-img" />
                    <h1 className="pacific-brand-title">
                      {isForgot ? 'Reset Password' : 'Forgot Password'}
                    </h1>
                    <p className="pacific-brand-subtitle">
                      {isForgot 
                        ? 'Enter OTP and create a new password' 
                        : 'Enter your details to receive OTP'}
                    </p>
                  </div>

                  <form onSubmit={isForgot ? handleReset : handleForget} className="pacific-login-form">
                    {!isForgot ? (
                      <>
                        <div className="pacific-input-group">
                          <label htmlFor="UserName" className="pacific-input-label">
                            Username <span className="pacific-required">*</span>
                          </label>
                          <div className="pacific-input-wrapper">
                            <FiUser className="pacific-input-icon" />
                            <input
                              type="text"
                              id="UserName"
                              name="UserName"
                              className="pacific-form-input"
                              placeholder="Enter your username"
                              value={credentials.UserName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="pacific-input-group">
                          <label htmlFor="Mobile" className="pacific-input-label">
                            Mobile Number <span className="pacific-required">*</span>
                          </label>
                          <div className="pacific-input-wrapper">
                            <FiPhone className="pacific-input-icon" />
                            <input
                              type="text"
                              id="Mobile"
                              name="Mobile"
                              maxLength={10}
                              className="pacific-form-input"
                              placeholder="Enter registered mobile number"
                              value={credentials.Mobile}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="pacific-input-group">
                          <label htmlFor="OTP" className="pacific-input-label">
                            OTP <span className="pacific-required">*</span>
                          </label>
                          <div className="pacific-input-wrapper">
                            <FiKey className="pacific-input-icon" />
                            <input
                              type="text"
                              id="OTP"
                              name="OTP"
                              className="pacific-form-input"
                              placeholder="Enter OTP"
                              value={credentials.OTP}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="pacific-input-group">
                          <label htmlFor="Password" className="pacific-input-label">
                            New Password <span className="pacific-required">*</span>
                          </label>
                          <div className="pacific-input-wrapper">
                            <FiLock className="pacific-input-icon" />
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="Password"
                              name="Password"
                              className="pacific-form-input"
                              placeholder="Enter new password"
                              value={credentials.Password}
                              onChange={handleChange}
                              required
                            />
                            <button
                              type="button"
                              className="pacific-toggle-password"
                              onClick={() => togglePassword('new')}
                            >
                              {showNewPassword ? <FiEye /> : <FiEyeOff />}
                            </button>
                          </div>
                        </div>

                        <div className="pacific-input-group">
                          <label htmlFor="ConfirmPassword" className="pacific-input-label">
                            Confirm Password <span className="pacific-required">*</span>
                          </label>
                          <div className="pacific-input-wrapper">
                            <FiLock className="pacific-input-icon" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="ConfirmPassword"
                              name="ConfirmPassword"
                              className="pacific-form-input"
                              placeholder="Confirm new password"
                              value={credentials.ConfirmPassword}
                              onChange={handleChange}
                              required
                            />
                            <button
                              type="button"
                              className="pacific-toggle-password"
                              onClick={() => togglePassword('confirm')}
                            >
                              {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      type="button"
                      className="pacific-back-link"
                      onClick={() => setRightPanelActive(false)}
                    >
                      <FiArrowLeft className="pacific-back-icon" />
                      Back to Login
                    </button>

                    <button
                      type="submit"
                      className="pacific-btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="pacific-loader-text">Processing...</span>
                      ) : (
                        <>
                          <span>{isForgot ? 'Reset Password' : 'Send OTP'}</span>
                          <FiArrowRight className="pacific-btn-icon" />
                        </>
                      )}
                    </button>
                  </form>

                  <footer className="pacific-powered-footer">
                    <span className="pacific-powered-text">
                        <img src={labroxLogo} alt="itDose Logo" className="pacific-powered-logo" />
                        Powered by <strong>LabRox New Gen Software</strong>
                    </span>
                    </footer>
                </>
              )}
            </div>
          </div>

          {/* Right Section - Image/Brand */}
          <div className="pacific-image-section"
        //    style={{
        //     backgroundImage: "url(https://img.freepik.com/free-vector/doctors-hospital-illustration_1284-22193.jpg?t=st=1766045380~exp=1766048980~hmac=05aabb26e37f7ef82e7bc2097fe7aba14493391e9b72fa47937e12c16159f49c&w=1060)",
        //     backgroundPosition: "center",
        //     backgroundRepeat: "no-repeat",
        //     backgroundSize: "cover"
        //    }}
          >
            <div className="pacific-gradient-overlay"></div>
            <div className="pacific-brand-content">
              <img src={loginImage} alt="Login Visual" className="pacific-hero-image" />
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default PacificLogin;