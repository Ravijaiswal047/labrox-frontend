import React from "react";
import "./Tooltip.css";

import { useTranslation } from "react-i18next";
const Tooltip = ({ label, children, className, position = "top" }) => {
  const [t] = useTranslation();

  return (
    <div
      className={`tooltip-container ${className}`}
      title={typeof label === "string" ? t(label) : undefined}
    >
      {children}
      <div
        className={`tooltip ${
          position === "bottom" ? "tooltip-bottom" : "tooltip-top"
        }`}
      >
        {typeof label ==='string' ? t(label) : label}
        {/* {t(label)} */}
      </div>
    </div>
  );
};

export default Tooltip;
