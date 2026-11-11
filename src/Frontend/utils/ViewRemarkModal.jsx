import { Dialog } from "primereact/dialog";
import React from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

const ViewRemarkModal = ({ show, handleClose, data }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("Add New Remarks")}
        visible={show}
        onHide={() => {
          handleClose();
        }}
        draggable={false}
        className={theme}
        style={{ width: "1000px" }}
      ></Dialog>
    </>
  );
};

export default ViewRemarkModal;
