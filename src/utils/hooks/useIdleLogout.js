import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { markUserActivity, startIdleLogoutWatcher } from "../idleLogout";

/**
 * App-wide idle auto-logout (timeout fetched from the server's
 * AppSettings:IdleLogoutMinutes via Login/GetAppSettings). Mount once near the root.
 * Uses a module singleton so remounts do not attach duplicate listeners.
 */
export function useIdleLogout() {
  const location = useLocation();

  useEffect(() => {
    startIdleLogoutWatcher();
  }, []);

  // Route changes are meaningful user activity (SPA navigation).
  useEffect(() => {
    markUserActivity();
  }, [location.pathname]);
}

export default useIdleLogout;
