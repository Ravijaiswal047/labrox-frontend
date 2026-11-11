import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { reset } from "../../../store/reducers/loginSlice/loginSlice";

const CenterDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [centreData, setCentreData] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(
    useLocalStorage("DefaultCentre", "get")
  );
  const localData = useLocalStorage("userData", "get");
  const [t] = useTranslation();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        const data = res.data.message;
        const mapped = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setCentreData(mapped);
      })
      .catch((err) => {
        // Only treat a real auth rejection (401/403) as "logged out" - any
        // other failure (network blip, timeout, or the session cookie not
        // yet propagated to this brand-new tab on iOS) is transient and
        // must not wipe the token/userData that login just wrote.
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          dispatch(reset());
          if (localData?.IsWebsiteLogin == 1) {
            window.location.href = localData?.Website;
          } else {
            navigate("/login");
          }
          window.sessionStorage.clear();
          window.localStorage.clear();
        }
        toast.error("Something went wrong");
      });
  }, []);

  const handleChangeDefaultCentre = (centreId) => {
    axiosInstance
      .post("CommonController/UpdateDefaultCentreID", {
        centerID: centreId,
      })
      .then(() => {
        useLocalStorage("DefaultCentre", "set", centreId);
        setSelectedCentre(centreId);
        setIsOpen(false);
        toast.success("Default centre updated successfully");
      })
      .catch((err) =>
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occurred"
        )
      );
  };

  return (
    <div className="font-size-picker" ref={dropdownRef} style={{ position: "relative" }}>
      <li className="nav-item d-md-flex px-1">
        <div type="button">
          <i
            className="fa fa-building text-white"
            aria-hidden="true"
            data-pr-tooltip={t("Select Default Centre")}
            data-pr-position="bottom"
            onClick={() => setIsOpen(!isOpen)}
            style={{ cursor: "pointer", padding: "0" }}
          ></i>
        </div>
      </li>

      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: "-42%",
            zIndex: 9999,
            backgroundColor: "#ffffff",
            borderRadius: "6px",
            padding: "6px 0",
            minWidth: "220px",
            listStyle: "none",
            margin: 0,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {centreData.map((centre) => (
            <li
              key={centre.value}
              onClick={() => handleChangeDefaultCentre(centre.value)}
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                color: selectedCentre === centre.value ? "#4fc3f7" : "#000000",
                fontWeight: selectedCentre === centre.value ? "bold" : "normal",
                backgroundColor:
                  selectedCentre === centre.value
                    ? "rgba(79,195,247,0.15)"
                    : "transparent",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                selectedCentre === centre.value
                  ? "rgba(79,195,247,0.15)"
                  : "transparent")
              }
            >
              {centre.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CenterDropdown;