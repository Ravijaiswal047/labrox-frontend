import { useTranslation } from "react-i18next";
import { setWindowClass } from "@app/utils/helpers";
import "./Login.css";
import LoginComponent from "./LoginComponent";
import { useEffect, useState } from "react";
import { loginFromToken } from "../../store/reducers/authSlice/authSlice";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import Loading from "../../components/loader/Loading";
import { useSelector } from "react-redux";
import LoginPage from "./NewLogin/LoginPage";
// import { baseUrl } from "../../utils/apiUrls";
// import LoginPage from '../NewLogin/LoginPage'
import LoginIndex from "../../Config/LoginIndex";

const Login = () => {
  const loading = useSelector((state) => state.loadingSlice.loading);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [guest_Token, setGuestToken] = useState(null);

  // Extract token once on mount
  const newToken = localStorage.getItem("guest_Token");


  // useEffect(() => {
  //   const hash = window.location.hash?.slice(1); // remove leading "#"
  //   let token = null;

  //   if (hash && (hash.includes(".") || hash.length > 20)) {
  //     // looks like a JWT or long random string
  //     token = hash;
  //     localStorage.setItem("guest_Token", token);

  //     // clean the URL so hash disappears
  //     window.history.replaceState({}, document.title, window.location.pathname);
  //   } else {
  //     token = localStorage.getItem("guest_Token");
  //   }

  //   setGuestToken(token);
  //   dispatch(setLoading(true));
  //   console.log("entered");
    
  //   if(newToken){
  //     console.log("entered inside");
  //     dispatch(loginFromToken({ token, navigate }));
  //   }
  //   dispatch(setLoading(false));
  // }, [newToken, window.location]);

  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    let token = null;
 
    if (hash && (hash.includes(".") || hash.length > 20)) {
        token = hash;
        localStorage.setItem("guest_Token", token);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        token = localStorage.getItem("guest_Token");
    }
 
    if (!token) {
        dispatch(setLoading(false));
        return;
    }
 
    // token is guaranteed fresh here — no stale newToken reference
    setGuestToken(token);
    dispatch(setLoading(true));
    dispatch(loginFromToken({ token, navigate }))
        .finally(() => dispatch(setLoading(false))); // ← await the thunk
 
}, [newToken, window.location]); 

  // apply login-page class
  useEffect(() => {
    localStorage.removeItem("User");
    setWindowClass("hold-transition login-page");
  }, []);

  return (
      <>
        {/* <LoginPage/> */}
        <LoginIndex/>
        {/* <div className="login-container">
         <div className="login-card">
           <div className="login-form-section">
             <LoginComponent guestToken={guest_Token} />
           </div>
         </div>
        </div> */}
      </>

  );
};

export default Login;
