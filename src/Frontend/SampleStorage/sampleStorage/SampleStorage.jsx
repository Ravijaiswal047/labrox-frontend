import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Discard from "./Discard";
import Storage from "./Storage";
import Issue from "./Issue";
import "./SampleStorage.css";

const SampleStorage = () => {
  const [t] = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Storage");
  const navList = [
    { label: t("Storage "), key: "Storage" },
    { label: t("Search"), key: "Search" },
    { label: t("Discard"), key: "Discard" },
  ];
  useEffect(() => {
    const hashTab = location.hash.replace("#", "") || "Storage";
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

      {activeTab === "Storage" && <Storage />}
      {activeTab === "Search" && <Issue />}
      {activeTab === "Discard" && <Discard />}
    </>
  );
};

export default SampleStorage;
