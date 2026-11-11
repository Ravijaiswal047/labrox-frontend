import { axiosInstance } from "./axiosInstance";
import { useLocalStorage } from "./hooks/useLocalStorage";

const DEFAULT_IDLE_TIMEOUT_MINUTES = 30;

let idleTimeoutMinutes = DEFAULT_IDLE_TIMEOUT_MINUTES;
let settingsFetched = false;

/** Idle auto-logout timeout in minutes, sourced from the server's AppSettings:IdleLogoutMinutes (see Login/GetAppSettings) */
export function getIdleTimeoutMinutes() {
  return idleTimeoutMinutes;
}

/**
 * Fetch the configured idle timeout from the server once per page load.
 * Falls back to the default if the call fails.
 */
async function fetchIdleTimeoutSetting() {
  if (settingsFetched) return;
  settingsFetched = true;
  try {
    const { data } = await axiosInstance.get("Login/GetAppSettings");
    const minutes = Number(data?.IdleLogoutMinutes);
    if (minutes > 0) {
      idleTimeoutMinutes = minutes;
      if (isLoggedIn() && !isPublicPath()) {
        scheduleIdleCheck();
      }
    }
  } catch {
    // keep default value; server may be unreachable
  }
}

function getIdleTimeoutMs() {
  return getIdleTimeoutMinutes() * 60 * 1000;
}

const ACTIVITY_THROTTLE_MS = 1000;
const LAST_ACTIVITY_KEY = "lastUserActivityAt";

const USER_ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "mouseup",
  "click",
  "keydown",
  "keyup",
  "keypress",
  "scroll",
  "wheel",
  "touchstart",
  "touchmove",
  "touchend",
  "pointerdown",
  "pointermove",
];

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/forgetpassword",
  "/forgotpassword",
  "/patientportallogin",
  "/labreport",
  "/qrcontroller",
  "/captchacomponent",
  "/privacypolicy",
  "/refundpolicy",
  "/termsandcondition",
];

let started = false;
let timerId = null;
let throttleUntil = 0;
let loggingOut = false;
let lastActivityAt = Date.now();

const HIDDEN_COL_KEYS = [
  "ResultEntryTable_HiddenCols",
  "ResultCultureTable_HiddenCols",
  "ResultAllergyTable_HiddenCols",
  "HistoCytoTable_HiddenCols",
  "ReceiptReprintTable_HiddenCols",
  "DispatchReportTable_HiddenCols",
];

function getUserData() {
  return useLocalStorage("userData", "get");
}

function isLoggedIn() {
  return !!(
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("userData")
  );
}

function isPublicPath() {
  const path = (window.location.pathname || "").toLowerCase();
  return PUBLIC_PATH_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

function persistLastActivity(ts) {
  lastActivityAt = ts;
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(ts));
  } catch {
    // ignore quota / private mode
  }
}

function getLastActivity() {
  let stored = 0;
  try {
    stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0) || 0;
  } catch {
    stored = 0;
  }
  return Math.max(lastActivityAt, stored);
}

function clearAuthStorage() {
  const preserved = {};
  HIDDEN_COL_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) preserved[key] = value;
  });

  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }
  try {
    localStorage.clear();
  } catch {
    // ignore
  }

  Object.entries(preserved).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  });

  try {
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/");
    });
  } catch {
    // ignore
  }
}

async function notifyServerLogout() {
  try {
    const userData = getUserData();
    if (!userData?.Username) return;
    await axiosInstance.post("Users/logout", {
      Username: userData.Username,
      SessionUniqueId: userData?.SessionUniqueId,
    });
  } catch {
    // Client logout must proceed even if API fails
  }
}

async function performIdleLogout() {
  if (loggingOut) return;
  if (!isLoggedIn() || isPublicPath()) return;

  loggingOut = true;
  stopIdleTimer();

  const userData = getUserData();
  const websiteRedirect =
    userData?.IsWebsiteLogin == 1 && userData?.Website
      ? userData.Website
      : null;

  await notifyServerLogout();
  clearAuthStorage();

  try {
    sessionStorage.setItem("idleLogoutMessage", "1");
  } catch {
    // ignore
  }

  if (websiteRedirect) {
    window.location.href = websiteRedirect;
  } else {
    window.location.href = "/login";
  }
}

function onIdle() {
  timerId = null;
  if (!isLoggedIn() || isPublicPath()) return;

  const elapsed = Date.now() - getLastActivity();
  const remaining = getIdleTimeoutMs() - elapsed;
  if (remaining > 500) {
    timerId = window.setTimeout(onIdle, remaining);
    return;
  }

  performIdleLogout();
}

function scheduleIdleCheck() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  if (!isLoggedIn() || isPublicPath()) return;
  timerId = window.setTimeout(onIdle, getIdleTimeoutMs());
}

function registerUserActivity() {
  if (!isLoggedIn() || isPublicPath()) return;

  const now = Date.now();
  if (now < throttleUntil) return;
  throttleUntil = now + ACTIVITY_THROTTLE_MS;

  persistLastActivity(now);
  scheduleIdleCheck();
}

function onVisibilityChange() {
  if (document.visibilityState !== "visible") return;
  if (!isLoggedIn() || isPublicPath()) return;

  const elapsed = Date.now() - getLastActivity();
  if (elapsed >= getIdleTimeoutMs()) {
    performIdleLogout();
    return;
  }
  scheduleIdleCheck();
}

function onStorage(event) {
  if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
    const ts = Number(event.newValue) || 0;
    if (ts > lastActivityAt) {
      lastActivityAt = ts;
      scheduleIdleCheck();
    }
  }
  if (
    (event.key === "token" || event.key === "userData") &&
    !event.newValue &&
    !isLoggedIn()
  ) {
    stopIdleTimer();
  }
}

function stopIdleTimer() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
}

/**
 * Start a single app-wide idle logout watcher.
 * Safe to call multiple times — listeners/timer are created once.
 */
export function startIdleLogoutWatcher() {
  if (started) {
    if (isLoggedIn() && !isPublicPath()) {
      persistLastActivity(Date.now());
      scheduleIdleCheck();
    }
    return;
  }
  started = true;
  fetchIdleTimeoutSetting();

  const opts = { capture: true, passive: true };
  USER_ACTIVITY_EVENTS.forEach((evt) => {
    document.addEventListener(evt, registerUserActivity, opts);
  });
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("storage", onStorage);

  if (isLoggedIn() && !isPublicPath()) {
    persistLastActivity(Date.now());
    scheduleIdleCheck();
  }
}

/**
 * Call after successful login so the idle window starts fresh.
 */
export function markUserActivity() {
  if (!isLoggedIn() || isPublicPath()) return;
  persistLastActivity(Date.now());
  scheduleIdleCheck();
}

export function stopIdleLogoutWatcher() {
  stopIdleTimer();
}
