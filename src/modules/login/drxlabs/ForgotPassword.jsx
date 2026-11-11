import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";

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
    <div className="drx_form_section drx_forgot_page">
      <div className="drx_form_card">
        <img src="/img/logo-drxlabs.jpg" alt="DrX Labs" className="drx_forgot_logo" />

        <h3 className="drx_heading">
          {isForgot ? "Reset Password" : "Forgot Password"}
        </h3>
        <p className="drx_subheading">
          {isForgot ? "Create a new secure password" : "Verify your account to continue"}
        </p>

        <form onSubmit={isForgot ? handleReset : handleForget}>
          {!isForgot ? (
            <>
              <div className="drx_form_group">
                <label className="drx_form_label">
                  Username <span className="drx_text_danger">*</span>
                </label>
                <input
                  type="text"
                  name="UserName"
                  className="drx_form_control"
                  placeholder="Enter your username"
                  value={credentials.UserName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="drx_form_group">
                <label className="drx_form_label">
                  Mobile Number <span className="drx_text_danger">*</span>
                </label>
                <input
                  type="text"
                  name="Mobile"
                  maxLength={10}
                  className="drx_form_control"
                  placeholder="Enter registered mobile number"
                  value={credentials.Mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="drx_form_group">
                <label className="drx_form_label">
                  OTP <span className="drx_text_danger">*</span>
                </label>
                <input
                  type="text"
                  name="OTP"
                  className="drx_form_control"
                  placeholder="Enter OTP"
                  value={credentials.OTP}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="drx_form_group">
                <label className="drx_form_label">
                  New Password <span className="drx_text_danger">*</span>
                </label>
                <div className="drx_position_relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="Password"
                    className="drx_form_control"
                    placeholder="Enter new password"
                    value={credentials.Password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="drx_toggle_password"
                    onClick={() => togglePassword("password")}
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </div>

              <div className="drx_form_group">
                <label className="drx_form_label">
                  Confirm Password <span className="drx_text_danger">*</span>
                </label>
                <div className="drx_position_relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="ConfirmPassword"
                    className="drx_form_control"
                    placeholder="Confirm new password"
                    value={credentials.ConfirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="drx_toggle_password"
                    onClick={() => togglePassword("confirm")}
                  >
                    {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="drx_form_footer" style={{ justifyContent: "flex-end" }}>
            <a href="#" className="drx_forgot_link" onClick={onCancel}>
              Back to Login
            </a>
          </div>

          <button type="submit" className="drx_btn_primary" disabled={loading}>
            {loading ? "Processing..." : isForgot ? "Reset Password" : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
