import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import healthGrowLogo from "../../../assets/image/healthgrow_new_logo.jpeg";

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
    <div className="hg_login_form_section hg_forgot_page">
      <div className="hg_login_form">
        <a href="#" className="hg_login_logo_link">
          <img src={healthGrowLogo} alt="Health Grow Path Lab" className="hg_login_logo" />
        </a>

        <h3 className="hg_login_heading">
          {isForgot ? "Reset Password" : "Forgot Password"}
        </h3>
        <p className="hg_login_subheading">
          {isForgot ? "Create a new secure password" : "Verify your account to continue"}
        </p>

        <form onSubmit={isForgot ? handleReset : handleForget}>
          {!isForgot ? (
            <>
              <div className="hg_form_group">
                <label htmlFor="UserName" className="hg_form_label">
                  Username <span className="hg_text_danger">*</span>
                </label>
                <input
                  type="text"
                  id="UserName"
                  name="UserName"
                  className="hg_form_control"
                  placeholder="Enter your username"
                  value={credentials.UserName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="hg_form_group">
                <label htmlFor="Mobile" className="hg_form_label">
                  Mobile Number <span className="hg_text_danger">*</span>
                </label>
                <input
                  type="text"
                  id="Mobile"
                  name="Mobile"
                  maxLength={10}
                  className="hg_form_control"
                  placeholder="Enter registered mobile number"
                  value={credentials.Mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="hg_form_group">
                <label htmlFor="OTP" className="hg_form_label">
                  OTP <span className="hg_text_danger">*</span>
                </label>
                <input
                  type="text"
                  id="OTP"
                  name="OTP"
                  className="hg_form_control"
                  placeholder="Enter OTP"
                  value={credentials.OTP}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="hg_form_group">
                <label htmlFor="Password" className="hg_form_label">
                  New Password <span className="hg_text_danger">*</span>
                </label>
                <div className="hg_position_relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="Password"
                    name="Password"
                    className="hg_form_control"
                    placeholder="Enter new password"
                    value={credentials.Password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="hg_toggle_password"
                    onClick={() => togglePassword("password")}
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </div>

              <div className="hg_form_group">
                <label htmlFor="ConfirmPassword" className="hg_form_label">
                  Confirm Password <span className="hg_text_danger">*</span>
                </label>
                <div className="hg_position_relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="ConfirmPassword"
                    name="ConfirmPassword"
                    className="hg_form_control"
                    placeholder="Confirm new password"
                    value={credentials.ConfirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="hg_toggle_password"
                    onClick={() => togglePassword("confirm")}
                  >
                    {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="hg_form_footer" style={{ justifyContent: "flex-end" }}>
            <a href="#" className="hg_forgot_link" onClick={onCancel}>
              Back to Login
            </a>
          </div>

          <button type="submit" className="hg_btn_primary" disabled={loading}>
            {loading ? "Processing..." : isForgot ? "Reset Password" : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
