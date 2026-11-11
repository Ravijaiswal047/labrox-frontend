import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setWindowClass } from "@app/utils/helpers";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FaUser, FaKey, FaMobileAlt } from "react-icons/fa";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";

import logo from "@app/assets/image/logo.png";
const PatientPortalLoginComponent = () => {
  const navigate = useNavigate();
  const [t] = useTranslation();

  const [credentials, setCredentials] = useState({
    UserName: "",
    Password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const [load, setLoad] = useState(false);
  const handleSubmitForPatientLogin = (e) => {
    e.preventDefault();
    if (window.location.pathname?.toLowerCase() === "/patientportallogin") {
      setLoad(true);
      axiosInstance
        .post("Login/PatientPortalLogin", {
          UserName: credentials?.UserName?.toString(),
          PassWord: credentials?.Password?.toString(),
        })
        .then((res) => {
          setLoad(false);
          navigate("/DispatchReport");
          sessionStorage.setItem(
            "patient_token",
            JSON.stringify(res?.data?.message?.token),
          );
          sessionStorage.setItem("User", 1);
          sessionStorage.setItem("data", JSON.stringify(res?.data?.data));

          useLocalStorage("theme", "set", "sky_blue_theme");
          setWindowClass(`hold-transition login-page ${"sky_blue_theme"}`);
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err?.response?.data?.message);
        });
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      handleSubmitForPatientLogin(e);
    }
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <>
      {load && <Loading />}
      <div className="main-login-outer-Container">
        <div className="container">
          <div
            className="contentss"
            style={{ textAlign: "center", justifyContent: "center" }}
          >
            <Link to="/">
              <img className="logoStyle" src={logo} alt="Logo" />
            </Link>
          </div>
          <div>
            <h2 className="login-heading">{t("Welcome to Patient Portal")}</h2>

            <p className="login-sub-heading">
              {t("Sign in to start your session")}
            </p>

            <div className="input-group">
              <span className="input-wrapper">
                <InputText
                  placeholder="Username"
                  type="text"
                  id="UserName"
                  ref={inputRef}
                  className="input-field username-field"
                  name="UserName"
                  value={credentials?.UserName}
                  lable={t("Username")}
                  onChange={handleChange}
                />
                <span className="login-icon">
                  <FaUser />
                </span>
              </span>
            </div>

            <div className="input-group">
              <span className="input-wrapper">
                <InputText
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  className="input-field password-field"
                  id="Password"
                  name="Password"
                  value={credentials?.Password}
                  lable={t("Password")}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
                <span
                  className="login-icon"
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  <FaKey />
                </span>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <button
                onClick={handleSubmitForPatientLogin}
                className="patientOtp"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientPortalLoginComponent;
