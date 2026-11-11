import { toast } from "react-toastify";
import { axiosInstance } from "./axiosInstance";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { addWindowClass, removeWindowClass, setWindowClass } from "./helpers";
import { setCurrentTheme } from "../store/reducers/loadingSlice/loadingSlice";

/**
 * Shared by layouts/header/Theme-dropdown/index.jsx and
 * NextGenProfilePanel's Theme picker — persists + applies a Classic
 * color-theme selection (POST + localStorage + body/#root class swap +
 * redux) so both UIs stay in sync instead of duplicating this logic.
 */
export async function applyTheme(themeSlug, currentTheme, dispatch) {
  try {
    const userData = useLocalStorage("userData", "get");
    await axiosInstance.post("CommonController/UpdateTheme", {
      Theme: themeSlug,
      EmployeeID: userData?.EmployeeID?.toString(),
    });

    setWindowClass(`hold-transition login-page ${themeSlug}`);
    useLocalStorage("theme", "set", themeSlug);
    addWindowClass(themeSlug);
    if (themeSlug !== currentTheme) removeWindowClass(currentTheme);

    dispatch(setCurrentTheme(themeSlug));
    toast.success("Theme Updated Successfully");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Error occurred while updating theme");
  }
}
