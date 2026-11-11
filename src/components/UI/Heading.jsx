import React from "react";
import Breadcrumb from "../Breadcrumb";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Heading({
  title,
  onClick,
  secondTitle,
  isBreadcrumb,
  ReactSelectPageWise,
  name,
  linkTo,
  linkTitle,
  onLinkClick,
  state,
  logout = false,
  handleLogout,
  backButton=false,
  mobileHeadingSuffix,
  hideSecondTitleOnMobile = false,
}) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="card card_background">
      <div className="card-header" onClick={onClick}>
        <h4 className="card-title w-100 d-flex align-items-center justify-content-between">
          {isBreadcrumb ? (
            mobileHeadingSuffix ? (
              <div className="d-flex align-items-center justify-content-between w-100 w-md-auto">
                <Breadcrumb path={location?.pathname} name={name} backButton={backButton} />
                <div className="d-md-none ms-2 flex-shrink-0">{mobileHeadingSuffix}</div>
              </div>
            ) : (
              <Breadcrumb path={location?.pathname} name={name} backButton={backButton} />
            )
          ) : (
            <div>
              <label className="text-nowrap m-0"> {title} </label>
            </div>
          )}

          {secondTitle && (
            <div className="mr-3 d-flex color-code-search-resp align-items-center justify-content-start justify-content-md-end overflow-auto w-100 w-md-auto">
              {ReactSelectPageWise && (
                <div className="mr-3 w" style={{ width: "1%" }}>
                  {ReactSelectPageWise}
                </div>
              )}
              {secondTitle}
            </div>
          )}

          {(linkTo || onLinkClick) && (
            <div
              className={`main-heading-link ${linkTo === "/receiptreprint" ? "d-none d-md-flex" : ""}`}
            >
              {onLinkClick ? (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: "#6d28d9", color: "#fff", fontWeight: 600, fontSize: 12, borderRadius: 6, padding: "4px 12px" }}
                  onClick={(e) => { e.stopPropagation(); onLinkClick(); }}
                >
                  {linkTitle}
                </button>
              ) : (
                <Link to={linkTo} state={state} className="btn btn-link">
                  {linkTitle}
                </Link>
              )}
            </div>
          )}

          {logout && (
            <div className="mr-4">
              <div onClick={handleLogout}>
                <i className="pi pi-sign-out"></i>
              </div>
            </div>
          )}
        </h4>
      </div>
    </div>
  );
}

export default Heading;
