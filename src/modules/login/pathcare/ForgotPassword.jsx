import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLoginLogic } from "../NewLogin/useLoginLogic";
import pathcareLogo from "../../../assets/image/pathcare.png";

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

  return (
    <>
      <img src={pathcareLogo} className="pathcare_login_logo" alt="itDose" />
      <h2 className="pathcare_login_title">
        {isForgot ? "Reset Password" : "Forgot Password"}
      </h2>

      <p className="pathcare_login_subtitle">
        {isForgot
          ? "Create a new secure password"
          : "Verify your account to continue"}
      </p>

      <form className="w-100" onSubmit={isForgot ? handleReset : handleForget}>
        {!isForgot ? (
          <>
            <div className="pathcare_form_group">
              <label>Username</label>
              <input
                type="text"
                name="UserName"
                value={credentials.UserName}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="pathcare_form_group">
              <label>Mobile Number</label>
              <input
                type="text"
                name="Mobile"
                value={credentials.Mobile}
                onChange={handleChange}
                placeholder="Registered mobile number"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="pathcare_form_group">
              <label>OTP</label>
              <input
                type="text"
                name="OTP"
                value={credentials.OTP}
                onChange={handleChange}
                placeholder="Enter OTP"
                required
              />
            </div>

            <div className="pathcare_form_group">
              <label>New Password</label>
              <div className="pathcare_password_wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  value={credentials.Password}
                  onChange={handleChange}
                  placeholder="New password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
            </div>

            <div className="pathcare_form_group">
              <label>Confirm Password</label>
              <div className="pathcare_password_wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="ConfirmPassword"
                  value={credentials.ConfirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="pathcare_form_meta end">
          <span className="pathcare_forgot" onClick={onCancel}>
            Back to Login
          </span>
        </div>

        <button className="pathcare_login_btn" disabled={loading}>
          {loading
            ? "Processing..."
            : isForgot
              ? "Reset Password"
              : "Send OTP"}
        </button>
      </form>
    </>
  );
};

export default ForgotPassword;
