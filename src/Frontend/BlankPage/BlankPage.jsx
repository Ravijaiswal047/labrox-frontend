import React from "react";
import { Link, useNavigate } from "react-router-dom";
import errorpage from "./errorpage.png";
import "./BlankPage.css";

import { useTranslation } from "react-i18next";
function BlankPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="warpper">
      <div className="content-wrapper">
        <div
          style={{
            height: "100%",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="row">
            <div className="col-sm-12">
              <div className="errorContainer">
                <img src={errorpage} alt={t("Error")} />
                <p className="error_content" style={{ whiteSpace: "nowrap" }}>
                  {t("404!")}
                </p>
                <p className="error_content" style={{ whiteSpace: "nowrap" }}>
                  {t("Uh Ohh ..Page Not Found!")}
                </p>
                <p className="errorParacontent">
                  {t(
                    "Sorry, the page you are looking for does not exist or has been moved.",
                  )}
                </p>
                <Link className="backLink" onClick={() => navigate(-1)}>
                  {t("Back To Last Page")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlankPage;
