import React from "react";
import { useTranslation } from "react-i18next";

const PlaceholderTab = ({ name }) => {
  const { t } = useTranslation();

  return (
    <div className="em-placeholder">
      <i className="fa fa-cogs" style={{ fontSize: "28px" }} />
      <div className="em-placeholder-title">{t(name)}</div>
      <div>{t("This tab is not built yet.")}</div>
    </div>
  );
};

export default PlaceholderTab;
