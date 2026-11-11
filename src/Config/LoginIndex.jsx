import React, { useEffect } from "react";
import OliveLoginPage from "../modules/login/OliveLogin/OliveLoginPage";
import PacificLogin from "../modules/login/PacificLogin/PacificLogin.jsx";
import ItDoseLogin from "../modules/login/ItDoseLogin/ItDoseLogin.jsx";
import NplLoginPage from "../modules/login/NplLogin/NplLoginPage.jsx";
import ApcLoginPage from "../modules/login/ApcLogin/ApcLogin.jsx";
import LoginPage from "../modules/login/NewLogin/LoginPage";
import Clients from "./Clients.js";
import ItDoseInfoLogin from "../modules/login/ItDoseInfoLogin/ItDoseLogin.jsx";
import PathcareLogin from "../modules/login/pathcare/pathcareLogin.jsx";
import NanjappaLogin from "../modules/login/nanjappa/NanjappaLogin.jsx";
import KarauliLogin from "../modules/login/karauli/KarauliLogin.jsx";
import HealthGrowLogin from "../modules/login/healthgrow/HealthGrowLogin.jsx";
import DrxLabsLogin from "../modules/login/drxlabs/DrxLabsLogin.jsx";
import ExultLogin from "../modules/login/exult/ExultLogin.jsx";
import { applyFaviconMeta } from "../utils/faviconUtil";

export default function LoginIndex() {
  const envUrl = import.meta.env.VITE_APP_REACT_APP_BASE_URL?.split("//")?.[1]?.split("/")?.[0];
  const components = {
    LoginPage,
    OliveLoginPage,
    ItDoseLogin,
    ApcLoginPage,
    NplLoginPage,
    PacificLogin,
    ItDoseInfoLogin,
    PathcareLogin,
    NanjappaLogin,
    KarauliLogin,
    HealthGrowLogin,
    DrxLabsLogin,
    ExultLogin
  };

  const hostWithPort = window.location.host;
  let client =
    Clients[hostWithPort] ||
    (envUrl ? Clients[envUrl] : null) ||
    Clients["localhost:3000"] ||
    Clients["uat-v9.itdoseinfo.com:8088"];
  let LoginComponent = components[client?.loginComponent] || ItDoseInfoLogin;
  if (hostWithPort?.includes("localhost")) {
    client =
      Clients[hostWithPort] ||
      (envUrl ? Clients[envUrl] : null) ||
      Clients["localhost:3000"] ||
      Clients["uat-v9.itdoseinfo.com:8088"];
    LoginComponent = components[client?.loginComponent] || ItDoseInfoLogin;
  } else {
    client = Clients[hostWithPort] || Clients["uat-v9.itdoseinfo.com:8088"];
    LoginComponent = components[client?.loginComponent] || ItDoseInfoLogin;
  }

  useEffect(() => {
    applyFaviconMeta();
  }, [client]);

  return <LoginComponent client={client} />;
}
