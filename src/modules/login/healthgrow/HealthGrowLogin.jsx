import React, { useState } from "react";
import "./HealthGrowLogin.css";
import { FiEye, FiEyeOff, FiUser, FiHash } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import ForgotPassword from "./ForgotPassword";
import healthGrowBg from "../../../assets/image/healthgrow_bg.png";
import labroxLogo from '../../../assets/image/labrox_logo.png';
import Footer from "../../../layouts/footer/Footer";
import AgreementPopup from "../AgreementPopup";
import ForceChangePasswordModal from "../ForceChangePasswordModal";

const HealthGrowLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

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
    if (loginStep === 1) return handleCheckUser(e);
    if (isOtpRequired) return handleOtpSubmit(e);
    return handleSubmit(e);
  };

  const togglePassword = () => setShowPassword(!showPassword);

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
      <div className="hg_login_main">
        <div>
          {isRightPanelActive ? (
            <ForgotPassword onCancel={() => setRightPanelActive(false)} />
          ) : (
            <div className="hg_login_row">
              <div className="hg_banner_section">
                <div className="hg_banner_panel">
                  <img src={healthGrowBg} alt="Health Grow Path Lab" className="hg_banner_image" />
                </div>
              </div>

              <div className="hg_login_form_section">
                <div className="hg_page_heading">
                  <h3 className="hg_login_heading">Welcome back!</h3>
                  <p className="hg_login_subheading">
                    Sign in to continue to Health Grow Path Lab
                  </p>
                </div>

                <div className="hg_login_form">
                  <form onSubmit={getSubmitHandler}>
                    <div className="hg_form_group">
                      <label htmlFor="username" className="hg_form_label">
                        Username <span className="hg_text_danger">*</span>
                      </label>
                      <div className="hg_position_relative">
                        <input
                          type="text"
                          id="username"
                          name="username"
                          className="hg_form_control"
                          placeholder="Enter your username"
                          value={credentials.username}
                          onChange={handleChange}
                          required
                          disabled={loginStep === 2}
                          autoComplete="off"
                        />
                        <span className="hg_field_icon">
                          <FiUser />
                        </span>
                      </div>
                    </div>

                    {loginStep === 2 && (
                      <>
                        {isOtpRequired ? (
                          <div className="hg_form_group">
                            <label htmlFor="OTP" className="hg_form_label">
                              OTP <span className="hg_text_danger">*</span>
                            </label>
                            <div className="hg_position_relative">
                              <input
                                type="text"
                                id="OTP"
                                name="OTP"
                                className="hg_form_control"
                                placeholder="Enter OTP sent to your mobile"
                                value={credentials.OTP}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                              />
                              <span className="hg_field_icon">
                                <FiHash />
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="hg_form_group">
                            <label htmlFor="password" className="hg_form_label">
                              Password <span className="hg_text_danger">*</span>
                            </label>
                            <div className="hg_position_relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="hg_form_control"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                              />
                              <button
                                type="button"
                                className="hg_toggle_password"
                                onClick={togglePassword}
                              >
                                {showPassword ? <FiEye /> : <FiEyeOff />}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="hg_form_footer">
                      <div className="hg_remember_me">
                        <input type="checkbox" id="rememberMe" />
                        <label htmlFor="rememberMe">Remember me</label>
                      </div>
                      <a
                        href="#"
                        className="hg_forgot_link"
                        onClick={() => setRightPanelActive(true)}
                      >
                        Forgot password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="hg_btn_primary"
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
                          className="hg_forgot_link"
                          style={{ fontSize: "12px", cursor: "pointer" }}
                          onClick={() => setLoginStep(1)}
                        >
                          Change Username?
                        </span>
                      </div>
                    )}
                  </form>
                </div>

                <footer className="d-block d-md-none mt-4">
                  <span className="hg_powered_badge">
                    <img src={labroxLogo} alt="LabRox" />
                    Powered by <strong>LabRox New Gen Software</strong>
                  </span>
                </footer>
              </div>
            </div>
          )}
        </div>

        <footer className="hg_login_powered_footer">
          <span className="hg_powered_badge">
            Powered by <strong>LabRox New Gen Software</strong>
          </span>
        </footer>
        <Footer />
      </div>
    </>
  );
};

export default HealthGrowLogin;
