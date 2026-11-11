import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";

import { axiosInstance } from "@app/utils/axiosInstance";
import Loading from "@app/components/loader/Loading";
import Clients from "@app/Config/Clients";
import logoFallback from "@app/assets/image/labrox_logo.png";

import "./B2BConnectLogin.css";

// Client-facing login for the B2B portal. Authenticates against the same
// users table / password as the internal LIMS login (Login/Login) and the
// same SHA-256 hashing — POST Controllers/B2BConnect_LoginController.cs,
// which only succeeds for a user whose RateTypeID > 0. No separate
// credential system, per the confirmed requirement.
const B2BConnectLoginComponent = () => {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const userRef = useRef(null);

  const [credentials, setCredentials] = useState({ UserName: "", Password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [load, setLoad] = useState(false);

  // Same white-label lookup PatientPortalLoginComp.jsx already uses, so
  // B2BConnect automatically carries each deployment's own branding.
  const client = useMemo(() => {
    const hostWithPort = window.location.host;
    const envUrl = import.meta.env.VITE_APP_REACT_APP_BASE_URL?.split("//")?.[1];
    const clientKey = hostWithPort?.includes("localhost") ? envUrl : hostWithPort;
    return Clients[clientKey] || Clients["uat-v9.itdoseinfo.com:8088"];
  }, []);

  useEffect(() => {
    userRef.current?.focus();
    if (sessionStorage.getItem("b2b_token")) {
      navigate("/B2BConnect/Dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!credentials.UserName.trim() || !credentials.Password.trim()) {
      toast.error(t("Please enter both username and password"));
      return;
    }

    setLoad(true);
    try {
      const res = await axiosInstance.post("B2BConnect_Login", {
        UserName: credentials.UserName.trim(),
        Password: credentials.Password,
      });

      if (res?.data?.success) {
        sessionStorage.setItem("b2b_token", JSON.stringify(res.data.token || "1"));
        sessionStorage.setItem("b2b_userData", JSON.stringify(res.data.user || {}));
        sessionStorage.setItem("PortalType", "B2BConnect");
        toast.success(res?.data?.message || t("Login successful"));
        navigate("/B2BConnect/Dashboard", { replace: true });
      } else {
        toast.error(res?.data?.message || t("Invalid username or password"));
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t("Something went wrong. Please try again."),
      );
    } finally {
      setLoad(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") handleSubmit(e);
  };

  return (
    <>
      {load && <Loading />}
      <div className="b2bc-login-shell">
        <div
          className="b2bc-login-brand"
          style={{ "--b2bc-brand": client?.themeColor || "#16247a" }}
        >
          <div className="b2bc-login-brand-inner">
            <img
              src={client?.logo || logoFallback}
              alt={client?.name || "HealthGrow"}
              className="b2bc-login-logo"
              onError={(e) => (e.target.src = logoFallback)}
            />
            <h1>{t("B2B Connect")}</h1>
            <p>{t("Your registrations, reports, billing and rates — in one place.")}</p>
            <ul className="b2bc-login-highlights">
              <li>{t("Track every sample from booking to report")}</li>
              <li>{t("See your rates, invoices and wallet balance")}</li>
              <li>{t("Manage your own sub-clients")}</li>
            </ul>
          </div>
        </div>

        <div className="b2bc-login-form-panel">
          <form className="b2bc-login-card" onSubmit={handleSubmit}>
            <h2>{t("Sign in")}</h2>
            <p className="b2bc-login-subtitle">
              {t("Use the same username and password as your HealthGrow LIMS account.")}
            </p>

            <label className="b2bc-field">
              <span>{t("Username")}</span>
              <div className="b2bc-input-wrap">
                <FaUser className="b2bc-input-icon" />
                <input
                  ref={userRef}
                  type="text"
                  name="UserName"
                  autoComplete="username"
                  value={credentials.UserName}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("Enter your username")}
                />
              </div>
            </label>

            <label className="b2bc-field">
              <span>{t("Password")}</span>
              <div className="b2bc-input-wrap">
                <FaLock className="b2bc-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  autoComplete="current-password"
                  value={credentials.Password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("Enter your password")}
                />
                <button
                  type="button"
                  className="b2bc-input-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <button type="submit" className="b2bc-login-submit">
              {t("Sign in")} <FaArrowRight />
            </button>

            <p className="b2bc-login-footnote">
              {t("Trouble signing in? Contact your lab administrator.")}
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default B2BConnectLoginComponent;
