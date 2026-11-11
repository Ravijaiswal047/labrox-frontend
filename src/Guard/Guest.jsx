import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import { getIdleTimeoutMinutes } from "../utils/idleLogout";

const Guest = ({ children }) => {
  const jwt =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const userData = useLocalStorage("userData", "get");

  // First-login can persist a token before userData is written. That is
  // not a complete session — stay on login so the Change Password popup
  // can finish (or the user can sign in again) without a cookie wipe.
  const isFullyLoggedIn = !!(userData && (jwt || localStorage.getItem("userData")));

  useEffect(() => {
    try {
      if (sessionStorage.getItem("idleLogoutMessage") === "1") {
        sessionStorage.removeItem("idleLogoutMessage");
        toast.info(
          `You have been logged out due to ${getIdleTimeoutMinutes()} minutes of inactivity.`,
          { autoClose: 5000 },
        );
      }
    } catch {
      // ignore
    }
  }, []);

  return isFullyLoggedIn ? <Navigate to="/dashboard" replace /> : children;
};
export default Guest;
