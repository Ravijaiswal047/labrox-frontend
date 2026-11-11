import axios from "axios";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { notify } from "./utils";

export const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_APP_REACT_APP_BASE_URL || "") + "/api/v1/",
  withCredentials: true,
});
export const axiosInstanceWithoutVersion = axios.create({
  baseURL: (import.meta.env.VITE_APP_REACT_APP_BASE_URL || "") + "/api/",
  withCredentials: true,
});

export const axiosReport = axios.create({
  baseURL: (import.meta.env.VITE_APP_REACT_APP_BASE_URL || "") + "/reports/v1/",
  withCredentials: true,
});
const dynamicUrl = import.meta.env.VITE_APP_REACT_APP_DYNAMIC_URL === "true";
const baseFromEnv = import.meta.env.VITE_APP_REACT_APP_BASE_URL;
export const APIBaseURL = dynamicUrl
  ? `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ""
    }/api/v1`
  : baseFromEnv;
  
  console.log("FINAL API URL:", APIBaseURL);

export const logOut = () => {
  const hiddenCols = localStorage.getItem("ResultEntryTable_HiddenCols");
  const hiddenColsCulture = localStorage.getItem("ResultCultureTable_HiddenCols");
  const hiddenColsAllergy = localStorage.getItem("ResultAllergyTable_HiddenCols");
  const hiddenColsHistoCyto = localStorage.getItem("HistoCytoTable_HiddenCols");
  const hiddenColsReceiptReprint = localStorage.getItem("ReceiptReprintTable_HiddenCols");
  const hiddenColsDispatch = localStorage.getItem("DispatchReportTable_HiddenCols");
  localStorage.clear();
  if (hiddenCols) {
    localStorage.setItem("ResultEntryTable_HiddenCols", hiddenCols);
  }
  if (hiddenColsCulture) {
    localStorage.setItem("ResultCultureTable_HiddenCols", hiddenColsCulture);
  }
  if (hiddenColsAllergy) {
    localStorage.setItem("ResultAllergyTable_HiddenCols", hiddenColsAllergy);
  }
  if (hiddenColsHistoCyto) {
    localStorage.setItem("HistoCytoTable_HiddenCols", hiddenColsHistoCyto);
  }
  if (hiddenColsReceiptReprint) {
    localStorage.setItem("ReceiptReprintTable_HiddenCols", hiddenColsReceiptReprint);
  }
  if (hiddenColsDispatch) {
    localStorage.setItem("DispatchReportTable_HiddenCols", hiddenColsDispatch);
  }
  window.location.href = "/login";
};


const makeApiRequest = async (url, options, header) => {
  const localData = useLocalStorage("token", "get");
  const validUser = useLocalStorage("userData", "get");
  const { method, data } = options;
  const lowerCaseMethod = method.toLowerCase();

  const headers = {
    "Content-Type": header ? header : "application/json",
    Authorization: localData && `Bearer ${localData}`,
  };

  const parameterChecker = () => {
    const symbol = url.includes("?") ? "&" : "?";
    return symbol;
  };

  const finalUrl = validUser
    ? `${url}${parameterChecker()}`
    : url;
  try {
    // debugger
    const response = await axiosInstance({
      method: lowerCaseMethod,
      url: url,
      ...(data && { data }),
      headers,
    });
    return response.data;
  } catch (error) {
    // console.log("ASdasdasd", error);
    // || error?.code === "ERR_NETWORK"
    if (
      (error?.response && error?.response?.status === 401) ||
      error?.response?.statusText === "Please authenticate"
    ) {
      if (!globalErrorFlag) {
        globalErrorFlag = true;
        globalErrorNotifier(error?.response?.statusText);
      }
      // logOut();
    }
    notify(error?.response?.message, "error");
    return error.response;
  }
};

export default makeApiRequest;