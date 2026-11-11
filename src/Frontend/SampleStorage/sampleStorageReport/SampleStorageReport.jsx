import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import "./SampleStorageReport.css";
import StorageReport from "./StorageReport";
import IssueReport from "./IssueReport";
import DiscardReport from "./DiscardReport";

const SampleStorageReport = () => {
  const [t] = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const navList = [
    { label: "Storage Report", key: "StorageReport" },
    { label: t("Issue Report"), key: "IssueReport" },
    { label: "Discard Report", key: "DiscardReport" },
  ];
  useEffect(() => {
    const hashTab = location.hash.replace("#", "") || "StorageReport";
    setActiveTab(hashTab);
  }, [location.hash]);

  const handleThemeClass = (key) => {
    setActiveTab(key);
    navigate(`#${key}`, { replace: true });
  };

  return (
    <>
      <div className="card-header">
        <div className="Card_title">
          <ul className="nav d-flex">
            {navList.map((menuItem) => (
              <li
                className={`nav-item mx-1 ${
                  activeTab === menuItem.key ? "active-tab-menu" : "text_black"
                }`}
                key={menuItem.key}
                style={{ padding: "3px 15px", cursor: "pointer" }}
                onClick={() => handleThemeClass(menuItem.key)}
              >
                <a href={`#${menuItem.key}`}>{menuItem.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {activeTab === "StorageReport" && <StorageReport />}
      {activeTab === "IssueReport" && <IssueReport />}
      {activeTab === "DiscardReport" && <DiscardReport />}
    </>
  );
};

export default SampleStorageReport;
