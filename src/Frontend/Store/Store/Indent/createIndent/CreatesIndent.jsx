import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import SalesIndent from "./SalesIndent";
import PurchaseIndent from "./PurchaseIndent";
import { useLocation } from "react-router-dom";

const CreatesIndent = () => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const { state } = useLocation();
  console.log(state, "state");
  const navList = [
    { label: t("SI"), key: "1" },
    { label: t("PI"), key: "2" },
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

  useEffect(() => {
    if (state?.IndentType) {
      if (state.IndentType === "SI") {
        setActiveTab("1");
      } else if (state.IndentType === "PI") {
        setActiveTab("2");
      }
    }
  }, [state]);

  return (
    <>
      <div className="card-header">
        <div className="Card_title_header">
          <ul className="nav d-flex">
            {navList.map((menuItem) => (
              <li
                className={`nav-item mx-1 ${activeTab === menuItem.key ? "active-tab-menu" : "text-black"
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
      {activeTab === "1" && <SalesIndent />}
      {activeTab === "2" && <PurchaseIndent />}

    </>
  );
};

export default CreatesIndent;
