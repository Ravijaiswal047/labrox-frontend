import React, { useState } from "react";
import { FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import ForgotPassword from "./ForgotPassword";
import Footer from "../../../layouts/footer/Footer";
import AgreementPopup from "../AgreementPopup";
import ForceChangePasswordModal from "../ForceChangePasswordModal";
import labroxLogo from '../../../assets/image/labrox_logo.png';
import "./DrxLabsLogin.css";

const DrxLabsLogin = () => {
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

      <div className="drx_main">
        <div>
          {isRightPanelActive ? (
            <ForgotPassword onCancel={() => setRightPanelActive(false)} />
          ) : (
            <div className="drx_row">
              <div className="drx_banner_section">
                <div className="drx_banner_panel">
                  <img
                    src="/img/logo-drxlabs.jpg"
                    alt="DrX Labs"
                    className="drx_banner_logo"
                  />
                  <img
                    src="/img/banner-drxlabs.jpg"
                    alt="DrX Labs - 1 Stop for all Preventive and Diagnostic Tests"
                    className="drx_banner_image"
                  />
                </div>
              </div>

              <div className="drx_form_section">
                <div className="drx_page_heading">
                  <h3 className="drx_heading">Welcome back!</h3>
                  <p className="drx_subheading">Sign in to continue to DrX Labs</p>
                </div>

                <div className="drx_form_card">
                  <form onSubmit={getSubmitHandler}>
                    <div className="drx_form_group">
                      <label className="drx_form_label">
                        Username <span className="drx_text_danger">*</span>
                      </label>
                      <div className="drx_position_relative">
                        <input
                          type="text"
                          className="drx_form_control"
                          placeholder="Enter your username"
                          value={credentials.username}
                          onChange={handleChange}
                          name="username"
                          required
                          disabled={loginStep === 2}
                          autoComplete="off"
                        />
                        <span className="drx_field_icon">
                          <FiUser />
                        </span>
                      </div>
                    </div>

                    {loginStep === 2 && (
                      <>
                        {isOtpRequired ? (
                          <div className="drx_form_group">
                            <label className="drx_form_label">
                              OTP <span className="drx_text_danger">*</span>
                            </label>
                            <div className="drx_position_relative">
                              <input
                                type="text"
                                name="OTP"
                                className="drx_form_control"
                                placeholder="Enter OTP sent to your mobile"
                                value={credentials.OTP}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="drx_form_group">
                            <label className="drx_form_label">
                              Password <span className="drx_text_danger">*</span>
                            </label>
                            <div className="drx_position_relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="drx_form_control"
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                              />
                              <button
                                type="button"
                                className="drx_toggle_password"
                                onClick={togglePassword}
                              >
                                {showPassword ? <FiEye /> : <FiEyeOff />}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="drx_form_footer">
                      {loginStep === 2 && !isOtpRequired ? (
                        <a
                          href="#"
                          className="drx_forgot_link"
                          onClick={(e) => {
                            e.preventDefault();
                            setRightPanelActive(true);
                          }}
                        >
                          Forgot password?
                        </a>
                      ) : (
                        <span />
                      )}
                    </div>

                    <button type="submit" className="drx_btn_primary" disabled={loading}>
                      {loading
                        ? "Processing..."
                        : loginStep === 1
                          ? "Next"
                          : "Login"}
                    </button>

                    {loginStep === 2 && (
                      <div className="text-end mt-2">
                        <span
                          className="drx_forgot_link"
                          style={{ fontSize: "12px", cursor: "pointer" }}
                          onClick={() => setLoginStep(1)}
                        >
                          Change Username?
                        </span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="drx_powered_footer">
          <span className="drx_powered_badge">
            <img src={labroxLogo} alt="LabRox" />
            Powered by <strong>LabRox New Gen Software</strong>
          </span>
        </footer>
        <Footer />
      </div>
    </>
  );
};

export default DrxLabsLogin;
