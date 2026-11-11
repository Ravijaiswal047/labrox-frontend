import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import ApprovalSalesIndent from "./ApprovalSalesIndent";
import ApprovalPurchaseIndent from "./ApprovalPurchaseIndent";

const IndentStatusAndApproval = () => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("SI");

  const navList = [
    { label: t("SI"), key: "SI" },
    { label: t("PI"), key: "PI" },
  ];
  const handleThemeClass = (key) => {
    let theme = useLocalStorage("theme", "get");
    let element = document.getElementById("root");
    const classList = Array.from(element.classList);

    classList.forEach((className) => {
      if (className !== theme && className.endsWith("_theme")) {
        element.classList.remove(className);
      }
    });
    setActiveTab(key);
    setIsActive(!isActive);
  };
  return (
    <>
      <div className="card-header">
        <div className="Card_title_header">
          <ul className="nav d-flex">
            {navList.map((menuItem) => (
              <li
                className={`nav-item mx-1 ${
                  activeTab === menuItem.key ? "active-tab-menu" : "text-black"
                }`}
                key={menuItem.key}
                style={{ padding: "3px 15px", cursor: "pointer" }}
                onClick={() => handleThemeClass(menuItem.key)}
              >
                <a style={{ color: "Rust blue", fontWeight: "bold" }}>{menuItem.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {activeTab === "SI" && <ApprovalSalesIndent type={activeTab} />}
      {activeTab === "PI" &&  <ApprovalSalesIndent type={activeTab} />}
    </>
  );
};

export default IndentStatusAndApproval;
