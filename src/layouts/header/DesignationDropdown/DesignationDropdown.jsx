import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../utils/axiosInstance";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const DesignationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [designation, setDesignation] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState(
    useLocalStorage("CurrentDesignation", "get")
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
      .get("Designation/getDesignationDataByEmployeeId")
      .then((res) => {
        if (res.data.success && Array.isArray(res?.data?.message)) {
          setDesignation(res.data.message);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChangeDefaultDesignation = (designationId) => {
    axiosInstance
      .post("CommonController/UpdateDefaultDesignationID", {
        designationID: designationId,
      })
      .then(() => {
        useLocalStorage("CurrentDesignation", "set", designationId);
        setSelectedDesignation(designationId);
        setIsOpen(false);
        toast.success("Default designation updated successfully");
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
    <div
      className="font-size-picker"
      ref={dropdownRef}
      style={{ position: "relative" }}
    >
      <li className="nav-item d-md-flex px-1">
        <div type="button">
          <i
            className="bi bi-briefcase-fill text-white"
            aria-hidden="true"
            data-pr-tooltip={t("Select Designation")}
            data-pr-position="bottom"
            onClick={() => designation.length > 0 && setIsOpen(!isOpen)}
            style={{
              cursor: designation.length > 0 ? "pointer" : "not-allowed",
              padding: "0",
              opacity: designation.length > 0 ? 1 : 0.5,
            }}
          ></i>
        </div>
      </li>

      {isOpen && designation.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
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
            left: "-42%",
          }}
        >
          {designation.map((desig) => (
            <li
              key={desig.DesignationID}
              onClick={() =>
                handleChangeDefaultDesignation(desig.DesignationID)
              }
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                color:
                  selectedDesignation === desig.DesignationID
                    ? "#4fc3f7"
                    : "#000000",
                fontWeight:
                  selectedDesignation === desig.DesignationID
                    ? "bold"
                    : "normal",
                backgroundColor:
                  selectedDesignation === desig.DesignationID
                    ? "rgba(79,195,247,0.15)"
                    : "transparent",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(79,195,247,0.1)")
              }
              onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                selectedDesignation === desig.DesignationID
                  ? "rgba(79,195,247,0.15)"
                  : "transparent")
              }
            >
              {desig.DesignationName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DesignationDropdown;