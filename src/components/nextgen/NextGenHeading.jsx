import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import "./NextGenHeading.css";

/**
 * NextGen replacement for components/UI/Heading.jsx. Reuses the existing
 * generic Breadcrumb component (../Breadcrumb) rather than duplicating it.
 */
export default function NextGenHeading({
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
  backButton = false,
  mobileHeadingSuffix,
}) {
  const location = useLocation();

  return (
    <div className="ng-heading">
      <div className="ng-heading__row" onClick={onClick}>
        {isBreadcrumb ? (
          <div className="ng-heading__breadcrumb-wrap">
            <Breadcrumb path={location?.pathname} name={name} backButton={backButton} />
            {mobileHeadingSuffix && (
              <div className="ng-heading__mobile-suffix">{mobileHeadingSuffix}</div>
            )}
          </div>
        ) : (
          <span className="ng-heading__title">{title}</span>
        )}

        {secondTitle && (
          <div className="ng-heading__extra">
            {ReactSelectPageWise && (
              <div className="ng-heading__extra-select">{ReactSelectPageWise}</div>
            )}
            {secondTitle}
          </div>
        )}

        {(linkTo || onLinkClick) &&
          (onLinkClick ? (
            <button
              type="button"
              className="ng-heading__link-btn"
              onClick={(e) => {
                e.stopPropagation();
                onLinkClick();
              }}
            >
              {linkTitle}
            </button>
          ) : (
            <Link to={linkTo} state={state} className="ng-heading__link">
              {linkTitle}
            </Link>
          ))}

        {logout && (
          <button
            type="button"
            className="ng-heading__logout"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <i className="pi pi-sign-out" />
          </button>
        )}
      </div>
    </div>
  );
}
