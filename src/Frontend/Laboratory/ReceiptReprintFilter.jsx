import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Tooltip from "../../components/formComponent/Tooltip";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
const ReceiptReprintFilter = ({ columnConfig, setColumnConfig, PageName }) => {
  const [show, setShow] = useState(false);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const [load, setLoad] = useState(false);
  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;
  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: PageName,
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        let data = res?.data?.message;

        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };
  const [t] = useTranslation();
  const toggleColumnVisibility = (column, index) => {
    setLoad(true);

    const updatedColumn =
      column?.header === "Action" || column?.header === "S.No"
        ? columnConfig.map((ele) => ({
            ...ele,
            visible: columnConfig[0]?.visible !== true,
          }))
        : columnConfig.map((ele, i) =>
            i === index ? { ...ele, visible: !ele.visible } : ele,
          );

    axiosInstance
      .post("Lab/SaveFilterTableReprintData", {
        SaveData: updatedColumn,
        PageName: PageName,
        EmployeeId: EmployeeID?.toString(),
      })
      .then(() => {
        setLoad(false);
        getFilterResultOption();
      })
      .catch(() => {
        setLoad(false);
        toast.error("Error");
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleShow = () => setShow(!show);

  const renderCard = () => {
    if (!show) return null;

    return ReactDOM.createPortal(
      <div
        ref={cardRef}
        className="children-data"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          borderRadius: "5px",
          zIndex: 999,
          minWidth: "auto",
          border: "1px solid grey",
          display: "flex",
          flexDirection: "column",
          padding: "4px",
          height: "400px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            alignItems: "center",
          }}
        >
          {columnConfig?.map((column, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1px 0",
                minWidth: "150px",
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <i className={`nav-icon mr-2`} />
                {column.header == "Action" || column.header == "S.No"
                  ? t("ToggleAll")
                  : t(column.header)}
              </div>
              <label
                className="switch"
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => toggleColumnVisibility(column, index)}
                />
                <span className="slider round2"></span>
              </label>
            </div>
          ))}
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <div ref={buttonRef} style={{ position: "relative" }}>
      <Tooltip label={t("Filter Results")}>
        <div
          className="header"
          style={{ cursor: "pointer" }}
          onClick={toggleShow}
        >
          <div style={{ width: "20px", height: "18px" }}>
            {/* <svg
              width="26"
              height="18"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="12"
                y="8"
                width="40"
                height="48"
                rx="8"
                ry="8"
                fill="#f4f4f4"
                stroke="#000"
                strokeWidth="2"
                className="blink"
              />
              <polygon
                points="20,16 44,16 32,32"
                fill="#ffd700"
                stroke="#000"
                strokeWidth="2"
                className="blink"
              />
              <rect
                x="28"
                y="34"
                width="8"
                height="16"
                rx="2"
                ry="2"
                fill="#333"
              />
            </svg> */}
            <i className="pi pi-cog mt-1 ml-2 Reprint"></i>
          </div>
        </div>
      </Tooltip>
      {load ? <Loading /> : renderCard()}
    </div>
  );
};

export default ReceiptReprintFilter;
