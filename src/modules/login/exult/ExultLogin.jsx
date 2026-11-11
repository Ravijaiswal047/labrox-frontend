import React, { useState } from "react";
import { FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import ForgotPassword from "./ForgotPassword";
import Footer from "../../../layouts/footer/Footer";
import AgreementPopup from "../AgreementPopup";
import ForceChangePasswordModal from "../ForceChangePasswordModal";
import labroxLogo from '../../../assets/image/labrox_logo.png';
import "./ExultLogin.css";

const ExultLogin = () => {
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

      <div className="exl_page">
        <div className="exl_content">
        {isRightPanelActive ? (
          <ForgotPassword onCancel={() => setRightPanelActive(false)} />
        ) : (
          <div className="exl_card">
            <img src="/img/escult.png" alt="Exult Diagnostics" className="exl_logo" />

            <h2 className="exl_title">Welcome Back</h2>
            <p className="exl_subtitle">Sign in to continue to Exult Diagnostics</p>

            <form onSubmit={getSubmitHandler} className="w-100">
              <div className="exl_form_group">
                <label>
                  Username <span className="exl_required">*</span>
                </label>
                <div className="exl_input_icon_wrap">
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                    disabled={loginStep === 2}
                    autoComplete="off"
                  />
                  <span className="exl_field_icon">
                    <FiUser />
                  </span>
                </div>
              </div>

              {loginStep === 2 && (
                <>
                  {isOtpRequired ? (
                    <div className="exl_form_group">
                      <label>
                        OTP <span className="exl_required">*</span>
                      </label>
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
                  ) : (
                    <>
                      <div className="exl_form_group">
                        <label>
                          Password <span className="exl_required">*</span>
                        </label>
                        <div className="exl_password_wrap">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            autoComplete="off"
                          />
                          <button type="button" onClick={togglePassword}>
                            {showPassword ? <FiEye /> : <FiEyeOff />}
                          </button>
                        </div>
                      </div>

                      <div className="exl_form_meta end">
                        <span
                          className="exl_link"
                          onClick={() => setRightPanelActive(true)}
                        >
                          Forgot password?
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}

              <button className="exl_btn" disabled={loading}>
                {loading
                  ? "Processing..."
                  : loginStep === 1
                    ? "Next"
                    : "Login"}
              </button>

              {loginStep === 2 && (
                <div className="exl_form_meta end" style={{ marginTop: 10 }}>
                  <span
                    className="exl_link"
                    style={{ fontSize: "12px" }}
                    onClick={() => setLoginStep(1)}
                  >
                    Change Username?
                  </span>
                </div>
              )}
            </form>

            <div className="exl_powered_footer">
              <img src={labroxLogo} alt="logo" />
              Powered by <strong>LabRox New Gen Software</strong>
            </div>
          </div>
        )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ExultLogin;
