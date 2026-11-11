import { useTranslation } from "react-i18next";
import { setWindowClass } from "@app/utils/helpers";
import "./PatientPortalLogin.css";
import LoginComponent from "./LoginComponent";
import LogoImage from "../../assets/image/logo elabpro bg.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PatientPortalLoginComponent from "./PatientPortalLoginComponent";
import PatientPortalLoginComp from "./PatientPortalLoginComp";

const PatientPortalLogin = () => {
  const [t] = useTranslation();
  setWindowClass("hold-transition login-page");

  //   useEffect(() => {
  //     localStorage.setItem("patientPortalLoginURL", window.location.path);
  //   }, []);


  return (
    <>
      <div className="login-container">
        <div className="login-wrapper">
          <PatientPortalLoginComp />
        </div>
        <div className="login-image" />
      </div>

    </>
  );
};

export default PatientPortalLogin;
