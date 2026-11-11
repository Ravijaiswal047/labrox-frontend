import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { FiX, FiLock, FiKey, FiCheckCircle, FiEye, FiEyeOff, FiUser, FiShield } from "react-icons/fi";

const ForceChangePasswordModal = ({ show, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  // Falls back to onSuccess when a caller doesn't pass onCancel, so
  // existing usages (X button / Cancel button just closing the modal)
  // keep working exactly as before.
  const handleCancel = onCancel || onSuccess;

  const [state, setState] = useState({
    UserType: "",
    UserName: "",
    OldPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [load, setLoad] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (show) {
      axiosInstance
        .get("changePassword/getUserDetail")
        .then((res) => {
          const data = res?.data?.message?.[0];
          setState((prev) => ({
            ...prev,
            UserType: data?.UserTypeName || "",
            UserName: data?.Username || "",
          }));
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Error fetching user details");
        });
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!state.OldPassword) newErrors.OldPassword = "Old password is required.";
    if (!state.NewPassword) {
      newErrors.NewPassword = "New password is required.";
    } else if (state.NewPassword.length < 6) {
      newErrors.NewPassword = "Password must be at least 6 characters.";
    }
    if (!state.ConfirmPassword) {
      newErrors.ConfirmPassword = "Please confirm your password.";
    } else if (state.ConfirmPassword !== state.NewPassword) {
      newErrors.ConfirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoad(true);
    axiosInstance
      .post("changePassword/changeUserPassword", {
        UserType: state.UserType,
        UserName: state.UserName,
        OldPassword: state.OldPassword,
        NewPassword: state.NewPassword,
        ConfirmPassword: state.ConfirmPassword,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success("Password changed. Please login with your new password.");
          setState((prev) => ({ ...prev, OldPassword: "", NewPassword: "", ConfirmPassword: "" }));
          onSuccess();
        } else {
          toast.error(res?.data?.message || "Failed to change password.");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error occurred.");
      })
      .finally(() => setLoad(false));
  };

  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes fcpFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fcpSpin {
          to { transform: rotate(360deg); }
        }
        .fcp-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: #fff !important;
        }
        .fcp-close-btn:hover { background: rgba(255,255,255,0.3) !important; }
        .fcp-cancel-btn:hover { background: #e5e7eb !important; }
        .fcp-submit-btn:hover { opacity: 0.9; }
        .fcp-eye-btn:hover { color: #6366f1 !important; }
      `}</style>

      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={iconCircleStyle}>
              <FiShield size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ color: "#fff", margin: 0, fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                {t("Change Password")}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.72)", margin: 0, fontSize: "0.75rem" }}>
                {t("Set a new password to continue")}
              </p>
            </div>
          </div>
          <button className="fcp-close-btn" style={closeBtnStyle} onClick={handleCancel} title="Close">
            <FiX size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "22px 26px 26px" }}>
          {/* User info row */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                <FiUser size={11} style={{ marginRight: 4, color: "#6366f1" }} />
                {t("User Type")}
              </label>
              <input style={readonlyInputStyle} value={state.UserType} disabled />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                <FiUser size={11} style={{ marginRight: 4, color: "#6366f1" }} />
                {t("User Name")}
              </label>
              <input style={readonlyInputStyle} value={state.UserName} disabled />
            </div>
          </div>

          {/* Old Password */}
          <div style={{ marginBottom: "13px" }}>
            <label style={labelStyle}>
              <FiLock size={11} style={{ marginRight: 4, color: "#6366f1" }} />
              {t("Old Password")} <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
            </label>
            <div style={inputWrapStyle}>
              <input
                className="fcp-input"
                type={showOld ? "text" : "password"}
                name="OldPassword"
                style={{ ...inputStyle, borderColor: errors.OldPassword ? "#ef4444" : "#e5e7eb" }}
                value={state.OldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
              <button type="button" className="fcp-eye-btn" style={eyeBtnStyle} onClick={() => setShowOld(!showOld)}>
                {showOld ? <FiEye size={14} /> : <FiEyeOff size={14} />}
              </button>
            </div>
            {errors.OldPassword && <div style={errorStyle}>{errors.OldPassword}</div>}
          </div>

          {/* New Password */}
          <div style={{ marginBottom: "13px" }}>
            <label style={labelStyle}>
              <FiKey size={11} style={{ marginRight: 4, color: "#6366f1" }} />
              {t("New Password")} <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
            </label>
            <div style={inputWrapStyle}>
              <input
                className="fcp-input"
                type={showNew ? "text" : "password"}
                name="NewPassword"
                style={{ ...inputStyle, borderColor: errors.NewPassword ? "#ef4444" : "#e5e7eb" }}
                value={state.NewPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              <button type="button" className="fcp-eye-btn" style={eyeBtnStyle} onClick={() => setShowNew(!showNew)}>
                {showNew ? <FiEye size={14} /> : <FiEyeOff size={14} />}
              </button>
            </div>
            {errors.NewPassword && <div style={errorStyle}>{errors.NewPassword}</div>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              <FiCheckCircle size={11} style={{ marginRight: 4, color: "#6366f1" }} />
              {t("Confirm Password")} <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
            </label>
            <div style={inputWrapStyle}>
              <input
                className="fcp-input"
                type={showConfirm ? "text" : "password"}
                name="ConfirmPassword"
                style={{ ...inputStyle, borderColor: errors.ConfirmPassword ? "#ef4444" : "#e5e7eb" }}
                value={state.ConfirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
              />
              <button type="button" className="fcp-eye-btn" style={eyeBtnStyle} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEye size={14} /> : <FiEyeOff size={14} />}
              </button>
            </div>
            {errors.ConfirmPassword && <div style={errorStyle}>{errors.ConfirmPassword}</div>}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="fcp-cancel-btn" style={cancelBtnStyle} onClick={handleCancel}>
              {t("Cancel")}
            </button>
            <button type="submit" className="fcp-submit-btn" style={submitBtnStyle} disabled={load}>
              {load
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <span style={spinnerStyle} /> {t("Saving...")}
                  </span>
                : t("Change Password")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999,
};
const cardStyle = {
  background: "#fff", borderRadius: "18px", width: "480px", maxWidth: "95vw",
  boxShadow: "0 24px 60px rgba(0,0,0,0.22)", overflow: "hidden",
  animation: "fcpFadeUp 0.22s ease",
};
const headerStyle = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between",
};
const iconCircleStyle = {
  width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const closeBtnStyle = {
  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px",
  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#fff",
};
const labelStyle = {
  display: "flex", alignItems: "center", fontSize: "0.78rem",
  fontWeight: 600, color: "#374151", marginBottom: "5px",
};
const inputWrapStyle = { position: "relative", display: "flex", alignItems: "center" };
const inputStyle = {
  width: "100%", padding: "9px 36px 9px 11px", border: "1.5px solid #e5e7eb",
  borderRadius: "8px", fontSize: "0.855rem", outline: "none",
  boxSizing: "border-box", background: "#fafafa", transition: "border-color 0.2s",
};
const readonlyInputStyle = {
  width: "100%", padding: "9px 11px", border: "1.5px solid #e5e7eb",
  borderRadius: "8px", fontSize: "0.855rem", outline: "none",
  boxSizing: "border-box", background: "#f3f4f6", color: "#6b7280",
};
const eyeBtnStyle = {
  position: "absolute", right: 9, background: "none", border: "none",
  cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: 0,
};
const errorStyle = { color: "#ef4444", fontSize: "0.72rem", marginTop: "3px" };
const submitBtnStyle = {
  flex: 1, background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  color: "#fff", border: "none", borderRadius: "8px", padding: "11px 0",
  fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
};
const cancelBtnStyle = {
  flex: "0 0 90px", background: "#f3f4f6", color: "#374151",
  border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "11px 0",
  fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
};
const spinnerStyle = {
  width: 13, height: 13, border: "2px solid rgba(255,255,255,0.35)",
  borderTopColor: "#fff", borderRadius: "50%",
  display: "inline-block", animation: "fcpSpin 0.7s linear infinite",
};

export default ForceChangePasswordModal;
