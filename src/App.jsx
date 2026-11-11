// import { useEffect } from "react";
// import { useWindowSize } from "@app/utils/hooks/useWindowSize";
// import { calculateWindowSize } from "@app/utils/helpers";
// import { useDispatch, useSelector } from "react-redux";
// import { setWindowSize } from "@app/store/reducers/ui";

// import RenderRoute from "@app/routes/RenderRoute";
// import Loading from "@app/components/loader/Loading";
// import { applyFaviconMeta } from "./utils/faviconUtil";
// import { setCurrentTheme } from "@app/store/reducers/loadingSlice/loadingSlice";
// import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
// const App = () => {
//   const windowSize = useWindowSize();
//   const screenSize = useSelector((state) => state.ui.screenSize);
//   const loading = useSelector((state) => state.loadingSlice.loading);

//   const dispatch = useDispatch();

//   useEffect(() => {
//     const storedTheme = useLocalStorage("theme", "get");
//     const initialTheme = storedTheme || "default_theme";

//     dispatch(setCurrentTheme(initialTheme));
//   }, [dispatch]);

//   useEffect(() => {
//     const size = calculateWindowSize(windowSize.width);
//     if (screenSize !== size) {
//       dispatch(setWindowSize(size));
//     }
//   }, [windowSize]);

//   useEffect(() => {
//     applyFaviconMeta();
//   }, [window.location.pathname]);

//   return (
//     <>
//       {loading && <Loading />}
//       <RenderRoute />
//     </>
//   );
// };



// export default App;


import { useEffect, useState } from "react";
import { useWindowSize } from "@app/utils/hooks/useWindowSize";
import { calculateWindowSize } from "@app/utils/helpers";
import { useDispatch, useSelector } from "react-redux";
import { setWindowSize } from "@app/store/reducers/ui";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

import RenderRoute from "@app/routes/RenderRoute";
import Loading from "@app/components/loader/Loading";
import { applyFaviconMeta } from "./utils/faviconUtil";
import { setCurrentTheme } from "@app/store/reducers/loadingSlice/loadingSlice";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { axiosInstance } from "@app/utils/axiosInstance";


const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useSelector((state) => state.ui.screenSize);
  const loading = useSelector((state) => state.loadingSlice.loading);
  const { i18n } = useTranslation();

  const dispatch = useDispatch();
  


  useEffect(() => {
    const storedTheme = useLocalStorage("theme", "get");
    const initialTheme = storedTheme || "default_theme";

    dispatch(setCurrentTheme(initialTheme));
  }, [dispatch]);

  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize, screenSize, dispatch]);

  useEffect(() => {
    applyFaviconMeta();
  }, [window.location.pathname]);

  // No language gate here any more. This component used to run its own translation
  // loader alongside LanguageProvider's, and the two used different key namespaces
  // for the same language - two-letter codes here, "lang-<Id>" there - while both
  // wrote to the same localStorage key and both called addResourceBundle with
  // overwrite off. Whichever response landed first won each key, so a page came out
  // as a mix of two languages. LanguageProvider is now the only loader. Until its
  // bundle arrives every t() falls back to its key, which is the English text, so
  // the app renders in English rather than blocking on a spinner.
  return (
    <>
      {loading && <Loading />}
      <RenderRoute />
    </>
  );
};

export default App;