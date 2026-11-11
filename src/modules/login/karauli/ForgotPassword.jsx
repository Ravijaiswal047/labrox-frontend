import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import karauliLogo from "../../../assets/image/karauli_logo.webp";

const ForgotPassword = ({ onCancel }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    credentials,
    handleChange,
    handleForget,
    handleReset,
    isForgot,
    loading,
  } = useLoginLogic();

  const togglePassword = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    else setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="karauli_login_form_section">
      <div className="karauli_login_form">
        <a href="#" className="karauli_login_logo_link">
          <img src={karauliLogo} alt="Karauli Diagnostics" className="karauli_login_logo" />
        </a>

        <h3 className="karauli_login_heading">
          {isForgot ? "Reset Password" : "Forgot Password"}
        </h3>
        <p className="karauli_login_subheading">
          {isForgot ? "Create a new secure password" : "Verify your account to continue"}
        </p>

        <form onSubmit={isForgot ? handleReset : handleForget}>
          {!isForgot ? (
            <>
              <div className="karauli_form_group">
                <label htmlFor="UserName" className="karauli_form_label">
                  Username <span className="karauli_text_danger">*</span>
                </label>
                <input
                  type="text"
                  id="UserName"
                  name="UserName"
                  className="karauli_form_control"
                  placeholder="Enter your username"
                  value={credentials.UserName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="karauli_form_group">
                <label htmlFor="Mobile" className="karauli_form_label">
                  Mobile Number <span className="karauli_text_danger">*</span>
                </label>
                <input
                  type="text"
                  id="Mobile"
                  name="Mobile"
                  maxLength={10}
                  className="karauli_form_control"
                  placeholder="Enter registered mobile number"
                  value={credentials.Mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="karauli_form_group">
                <label htmlFor="OTP" className="karauli_form_label">
                  OTP <span className="karauli_text_danger">*</span>
                </label>
                <input
                  type="text"
                  id="OTP"
                  name="OTP"
                  className="karauli_form_control"
                  placeholder="Enter OTP"
                  value={credentials.OTP}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="karauli_form_group">
                <label htmlFor="Password" className="karauli_form_label">
                  New Password <span className="karauli_text_danger">*</span>
                </label>
                <div className="karauli_position_relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="Password"
                    name="Password"
                    className="karauli_form_control"
                    placeholder="Enter new password"
                    value={credentials.Password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="karauli_toggle_password"
                    onClick={() => togglePassword("password")}
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </div>

              <div className="karauli_form_group">
                <label htmlFor="ConfirmPassword" className="karauli_form_label">
                  Confirm Password <span className="karauli_text_danger">*</span>
                </label>
                <div className="karauli_position_relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="ConfirmPassword"
                    name="ConfirmPassword"
                    className="karauli_form_control"
                    placeholder="Confirm new password"
                    value={credentials.ConfirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="karauli_toggle_password"
                    onClick={() => togglePassword("confirm")}
                  >
                    {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="karauli_form_footer" style={{ justifyContent: "flex-end" }}>
            <a href="#" className="karauli_forgot_link" onClick={onCancel}>
              Back to Login
            </a>
          </div>

          <button type="submit" className="karauli_btn_primary" disabled={loading}>
            {loading ? "Processing..." : isForgot ? "Reset Password" : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
