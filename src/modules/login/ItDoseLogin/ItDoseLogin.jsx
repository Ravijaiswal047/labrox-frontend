// import React from "react";
// import LoginComponent from "../LoginComponent";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginFromToken } from "../../../store/reducers/authSlice/authSlice";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import { useTranslation } from "react-i18next";
import LoginComponent from "../LoginComponent";
import { setWindowClass } from "../../../utils/helpers";

// const ItDoseLogin=()=>{
//     return(
//         <>
//         <div className="login-container">
//          <div className="login-card">
//            <div className="login-form-section">
//              <LoginComponent guestToken={''} />
//            </div>
//          </div>
//         </div>
//         </>
//     )
// }

// export default ItDoseLogin;

const ItDoseLogin = () => {
  const loading = useSelector((state) => state.loadingSlice.loading);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [guest_Token, setGuestToken] = useState(null);

  // Extract token once on mount
  const newToken = localStorage.getItem("guest_Token");
  useEffect(() => {
    const hash = window.location.hash?.slice(1); // remove leading "#"
    let token = null;

    if (hash && (hash.includes(".") || hash.length > 20)) {
      // looks like a JWT or long random string
      token = hash;
      localStorage.setItem("guest_Token", token);

      // clean the URL so hash disappears
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      token = localStorage.getItem("guest_Token");
    }

    setGuestToken(token);
    dispatch(setLoading(true));
    if(newToken){
      dispatch(loginFromToken({ token, navigate }));
    }
    dispatch(setLoading(false));
  }, [newToken, window.location]);

  // apply login-page class
  useEffect(() => {
    setWindowClass("hold-transition login-page");
  }, []);

  return (
      <>
        {/* <LoginPage/> */}
        <div className="login-container">
         <div className="login-card">
           <div className="login-form-section">
             <LoginComponent guestToken={guest_Token} />
           </div>
         </div>
        </div>
      </>

  );
};

export default ItDoseLogin;
