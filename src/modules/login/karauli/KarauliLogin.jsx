import React, { useState } from "react";
import "./KarauliLogin.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import ForgotPassword from "./ForgotPassword";
import karauliLogo from "../../../assets/image/karauli_logo.webp";
import karauliBg from "../../../assets/image/karauli_bg.webp";
import labroxLogo from '../../../assets/image/labrox_logo.png';
import Footer from "../../../layouts/footer/Footer";
import AgreementPopup from "../AgreementPopup";
import ForceChangePasswordModal from "../ForceChangePasswordModal";

const KarauliLogin = () => {
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
      <div className="karauli_login_main">
        <div>
          {isRightPanelActive ? (
            <ForgotPassword onCancel={() => setRightPanelActive(false)} />
          ) : (
            <div className="karauli_login_row">
              <div className="karauli_login_form_section">
                <div className="karauli_login_form">
                  <a href="#" className="karauli_login_logo_link">
                    <img
                      src={karauliLogo}
                      alt="Karauli Diagnostics"
                      className="karauli_login_logo"
                    />
                  </a>

                  <h3 className="karauli_login_heading">Welcome back!</h3>
                  <p className="karauli_login_subheading">
                    Sign in to continue to Karauli Diagnostics
                  </p>

                  <form onSubmit={getSubmitHandler}>
                    <div className="karauli_form_group">
                      <label htmlFor="username" className="karauli_form_label">
                        Username <span className="karauli_text_danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="karauli_form_control"
                        placeholder="Enter your username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        disabled={loginStep === 2}
                        autoComplete="off"
                      />
                    </div>

                    {loginStep === 2 && (
                      <>
                        {isOtpRequired ? (
                          <div className="karauli_form_group">
                            <label htmlFor="OTP" className="karauli_form_label">
                              OTP <span className="karauli_text_danger">*</span>
                            </label>
                            <input
                              type="text"
                              id="OTP"
                              name="OTP"
                              className="karauli_form_control"
                              placeholder="Enter OTP sent to your mobile"
                              value={credentials.OTP}
                              onChange={handleChange}
                              required
                              autoComplete="off"
                            />
                          </div>
                        ) : (
                          <div className="karauli_form_group">
                            <label htmlFor="password" className="karauli_form_label">
                              Password <span className="karauli_text_danger">*</span>
                            </label>
                            <div className="karauli_position_relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="karauli_form_control"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                              />
                              <button
                                type="button"
                                className="karauli_toggle_password"
                                onClick={togglePassword}
                              >
                                {showPassword ? <FiEye /> : <FiEyeOff />}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="karauli_form_footer">
                      <div className="karauli_remember_me">
                        <input type="checkbox" id="rememberMe" />
                        <label htmlFor="rememberMe">Remember me</label>
                      </div>
                      <a
                        href="#"
                        className="karauli_forgot_link"
                        onClick={() => setRightPanelActive(true)}
                      >
                        Forgot password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      className="karauli_btn_primary"
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
                          className="karauli_forgot_link"
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
                  <span className="karauli_powered_badge">
                    <img src={labroxLogo} alt="LabRox" />
                    Powered by <strong>LabRox New Gen Software</strong>
                  </span>
                </footer>
              </div>

              <div className="karauli_banner_section">
                <div className="karauli_banner_panel">
                  <img src={karauliBg} alt="Karauli Diagnostics" className="karauli_banner_image" />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="karauli_login_powered_footer">
          <span className="karauli_powered_badge">
            Powered by <strong>LabRox New Gen Software</strong>
          </span>
        </footer>
        <Footer />
      </div>
    </>
  );
};

export default KarauliLogin;
