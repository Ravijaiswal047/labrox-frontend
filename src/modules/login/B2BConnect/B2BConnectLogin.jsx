import { setWindowClass } from "@app/utils/helpers";
import B2BConnectLoginComponent from "./B2BConnectLoginComponent";
import "./B2BConnectLogin.css";

// Route target for /B2BConnect/Login. Kept as a thin wrapper — same shape as
// modules/login/PatientPortalLogin.jsx — so the actual form can be iterated
// on independently of window/theme setup.
const B2BConnectLogin = () => {
  setWindowClass("hold-transition login-page b2bconnect-theme");
  return <B2BConnectLoginComponent />;
};

export default B2BConnectLogin;
