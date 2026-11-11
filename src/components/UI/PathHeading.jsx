import React from "react";
import { useLocation, Link } from "react-router-dom";

const menuItems = [
  { name: "Patient Registeration", url: "/patientregister" },
  { name: "Sample Collection", url: "/SampleCollection" },
  { name: "Department Receive", url: "/DepartmentReceive" },
  { name: "Result Entry", url: "/ResultEntry" },
  { name: "Dispatch Report", url: "/DispatchReport" },
];

function PathHeading() {
  const location = useLocation();

  return (
    <div className="card card_background">
      <div className="card-header">
        <h4 className="card-title w-100 d-md-flex align-items-center justify-content-between">
          <div className="ss-none">
            <div className="main-menu-container">
              {menuItems.map((item) => (
                <span
                  key={item.url}
                  className={`nav-item mx-1 fw-normal ${
                    location.pathname.toLowerCase() === item?.url.toLowerCase()
                      ? "active-sub-menu-list-style"
                      : "colortheme-button"
                  }`}
                >
                  <a>
                    <Link to={item.url}>
                      <i className={`fas fa-tachometer-alt nav-icon mr-1`} />{" "}
                      {item.name}
                    </Link>
                  </a>
                </span>
              ))}
            </div>
          </div>
        </h4>
      </div>
    </div>
  );
}

export default PathHeading;
