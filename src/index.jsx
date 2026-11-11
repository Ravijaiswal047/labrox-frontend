import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "@app/App";
import store from "@store/store";
import "./utils/i18n";
import "./index.css";
import "@app/assets/css/theme.css";
import "@app/styles/nextgen/fonts.css";
import "@app/styles/nextgen/variables.css";
import "@app/styles/nextgen/shell.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import ReactGA from "react-ga4";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import React from "react";

import "primeicons/primeicons.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// rc-easyui and react-quill CSS removed from global bundle.
// Import them only in the specific pages/components that use them.
import ErrorBoundary from "./ErrorBoundary";
import { GoogleOAuthProvider } from "@react-oauth/google";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <PrimeReactProvider>
    <Provider store={store}>
      <BrowserRouter>
        {/* <App /> */}
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
         <ErrorBoundary>
          <App />
        </ErrorBoundary>
          </GoogleOAuthProvider>
        {/* <Confirmation  /> */}
      </BrowserRouter>
    </Provider>
  </PrimeReactProvider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
