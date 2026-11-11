import { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Link, useNavigate } from "react-router-dom";
import Image from "./user.png";
const UserDropdown = ({
  dropdownOpen,
  setDropdownOpen,
  isMobile,
  logOut,
  emp,
  setUploadImage,
}) => {
  const localData = useLocalStorage("userData", "get");
  const [t] = useTranslation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {!isMobile ? (
        <div>
          <img
            src={emp}
            alt=""
            width={28}
            onError={(e) => (e.target.src = Image)}
            style={{
              transition: "transform 0.3s ease",
            }}
            height={23}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")} // Zoom in on hover
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            className="rounded-circle"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
          />
        </div>
      ) : (
        ""
      )}

      {dropdownOpen ? (
        <div className="manage_usermodel bg-color-container" ref={dropdownRef}>
          <div className="mt-2">
            <img
              src={emp}
              alt=""
              onError={(e) => (e.target.src = Image)}
              style={{
                borderRadius: "50%",
                height: "100px",
                width: "100px",
                marginBottom: "2px",

                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")} // Zoom in on hover
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            />
          </div>
          <div>
            <label className="companylabel">{localData?.Username}</label>
          </div>

          <div className="companybutton">
            <button
              type="button"
              className="text-white rounded Edit_detail"
              onClick={() => {
                setUploadImage({ data: localData?.ImageGuid, show: true });
              }}
            >
              {/* <Link
                to="/CreateEmployeeMaster"
                style={{ color: "white" }}
                state={{
                  button: "Update",
                  url1: "Employee/getEmployeeDetailsByID",
                  url2: "Employee/UpdateEmployee",
                  id: localData?.EmployeeID,
                }}
              >
                {t("Edit Profile")}
              </Link> */}
              {t("Edit Profile")}
            </button>

            <button
              type="button"
              className=" text-white rounded change_password"
              onClick={logOut}
            >
              {t("Logout")}
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default UserDropdown;
