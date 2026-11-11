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

  return (
    <div className="exl_card">
      <img src="/img/escult.png" alt="Exult Diagnostics" className="exl_logo" />

      <h2 className="exl_title">
        {isForgot ? "Reset Password" : "Forgot Password"}
      </h2>
      <p className="exl_subtitle">
        {isForgot
          ? "Create a new secure password"
          : "Verify your account to continue"}
      </p>

      <form className="w-100" onSubmit={isForgot ? handleReset : handleForget}>
        {!isForgot ? (
          <>
            <div className="exl_form_group">
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

            <div className="exl_form_group">
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
            <div className="exl_form_group">
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

            <div className="exl_form_group">
              <label>New Password</label>
              <div className="exl_password_wrap">
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

            <div className="exl_form_group">
              <label>Confirm Password</label>
              <div className="exl_password_wrap">
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

        <div className="exl_form_meta end">
          <span className="exl_link" onClick={onCancel}>
            Back to Login
          </span>
        </div>

        <button className="exl_btn" disabled={loading}>
          {loading
            ? "Processing..."
            : isForgot
              ? "Reset Password"
              : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
