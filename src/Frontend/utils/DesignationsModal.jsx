import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

function DesignationsModal({ show, onHide, designationList }) {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  return (
    <Dialog
      header={t("All Designations")}
      onHide={onHide}
      visible={show}
      style={{ width: isMobile ? "40vw" : "25vw" }}
      className={theme}
    >
      <div style={{ padding: "10px" }}>
        <ul style={{ paddingLeft: "20px", listStyleType: "disc", color: "black" }}>
          {designationList?.map((des, index) => (
            <li key={index} style={{ marginBottom: "6px" }}>
              {des}
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}

export default DesignationsModal;