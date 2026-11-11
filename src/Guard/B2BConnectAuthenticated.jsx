import { Navigate } from "react-router-dom";

// Guards every /B2BConnect/* screen except the login page itself.
//
// B2BConnect keeps its own session keys (b2b_token / b2b_userData /
// PortalType) entirely separate from the internal LIMS session (token /
// userData, checked by Guard/Authenticated.jsx) and the Patient Portal
// session (User / data). All three log in through the same backend cookie
// scheme, but because each portal reads/writes different sessionStorage
// keys, a session in one portal is simply invisible to the other two guards
// — no extra cross-portal redirect logic needed on either side.
const B2BConnectAuthenticated = ({ children }) => {
  const token = sessionStorage.getItem("b2b_token");
  return token ? children : <Navigate to="/B2BConnect/Login" replace />;
};

export default B2BConnectAuthenticated;
