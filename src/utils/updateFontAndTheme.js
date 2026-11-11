import { axiosInstance } from "./axiosInstance";
import { useLocalStorage } from "./hooks/useLocalStorage";

export async function updateFontAndTheme({ theme = "", fontFamily = "" } = {}) {
  try {
    const userData = useLocalStorage("userData", "get");
    await axiosInstance.post("CommonController/UpdateFontAndTheem", {
      employeeID: userData?.EmployeeID?.toString() || "",
      theme,
      font_Faimly: fontFamily,
    });
  } catch (err) {
    console.error("Failed to update font/theme", err);
  }
}
